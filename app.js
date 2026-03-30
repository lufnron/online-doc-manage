// 在线文档索引 - 主逻辑
// 读取JSON数据，渲染分类和文档卡片，处理筛选交互

let data = null;
let currentCategory = 'all';
let currentKeyword = '';

// DOM 元素
const categoryList = document.getElementById('categoryList');
const mobileCategoryList = document.getElementById('mobileCategoryList');
const documentGrid = document.getElementById('documentGrid');
const searchInput = document.getElementById('searchInput');
const loadingPlaceholder = document.getElementById('loadingPlaceholder');
const emptyState = document.getElementById('emptyState');
const mobileCategoryModal = document.getElementById('mobileCategoryModal');
const toggleCategoryBtn = document.getElementById('toggleCategoryBtn');
const closeMobileCategory = document.getElementById('closeMobileCategory');

// 初始化
document.addEventListener('DOMContentLoaded', init);

function init() {
  loadData()
    .then(() => {
      renderCategories();
      renderDocuments();
      bindEvents();
    })
    .catch(err => {
      console.error('加载数据失败:', err);
      loadingPlaceholder.textContent = '加载数据失败，请检查 data/documents.json 文件是否存在';
    });
}

// 加载JSON数据
async function loadData() {
  const timestamp = new Date().getTime(); // 避免缓存
  const response = await fetch(`data/documents.json?t=${timestamp}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  data = await response.json();
  
  // 分类按sort排序
  data.categories.sort((a, b) => a.sort - b.sort);
  
  // 文档按创建时间倒序
  data.documents.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

// 渲染分类列表
function renderCategories() {
  // 添加"全部"选项
  const allCategoryHtml = `
    <li>
      <a 
        href="#" 
        class="block px-3 py-2 rounded-md ${currentCategory === 'all' ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700 hover:bg-gray-100'}" 
        data-category-id="all"
      >
        全部
      </a>
    </li>
  `;
  
  const categoriesHtml = data.categories.map(category => {
    const isActive = currentCategory === category.id;
    return `
      <li>
        <a 
          href="#" 
          class="block px-3 py-2 rounded-md ${isActive ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700 hover:bg-gray-100'}" 
          data-category-id="${category.id}"
        >
          ${category.name}
        </a>
      </a>
    `;
  }).join('');
  
  categoryList.innerHTML = allCategoryHtml + categoriesHtml;
  mobileCategoryList.innerHTML = allCategoryHtml + categoriesHtml;
}

// 获取分类名称
function getCategoryName(categoryId) {
  const category = data.categories.find(c => c.id === categoryId);
  return category ? category.name : '未分类';
}

// 渲染文档卡片
function renderDocuments() {
  const filtered = filterDocuments();
  
  if (filtered.length === 0) {
    documentGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }
  
  documentGrid.classList.remove('hidden');
  emptyState.classList.add('hidden');
  
  // 移除加载占位符
  const placeholder = document.getElementById('loadingPlaceholder');
  if (placeholder) {
    placeholder.remove();
  }
  
  const cardsHtml = filtered.map(doc => {
    const categoryName = getCategoryName(doc.categoryId);
    const remark = doc.remark || '';
    const docJson = JSON.stringify({name: doc.name, url: doc.url}).replace(/"/g, '&quot;');
    
    return `
      <div 
        class="block bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
      >
        <a 
          href="${doc.url}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="block"
        >
          <div class="p-5 pb-3">
            <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              📄 ${doc.name}
            </h3>
            <div class="mb-3">
              <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                🏷️ ${categoryName}
              </span>
            </div>
            ${remark ? `<p class="text-gray-600 text-sm mb-3 line-clamp-2">💬 ${remark}</p>` : '<div class="mb-3"></div>'}
            <div class="flex justify-between items-center text-xs text-gray-500 mb-2">
              <span>📅 ${doc.createdAt}</span>
              <span class="text-blue-600">🔗 点击打开</span>
            </div>
          </div>
        </a>
        <div class="px-5 pb-4">
          <button 
            class="copy-btn w-full py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors text-sm font-medium"
            data-name="${doc.name}"
            data-url="${doc.url}"
            onclick="event.stopPropagation(); copyDocInfo(this)"
          >
            📋 复制文档信息
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  documentGrid.innerHTML = cardsHtml;
}

// 过滤文档
function filterDocuments() {
  let filtered = data.documents;
  
  // 按分类筛选
  if (currentCategory !== 'all') {
    filtered = filtered.filter(doc => doc.categoryId === currentCategory);
  }
  
  // 按关键词筛选
  if (currentKeyword && currentKeyword.trim()) {
    const keyword = currentKeyword.trim().toLowerCase();
    filtered = filtered.filter(doc => 
      doc.name.toLowerCase().includes(keyword) || 
      (doc.remark && doc.remark.toLowerCase().includes(keyword))
    );
  }
  
  return filtered;
}

// 绑定事件
function bindEvents() {
  // 分类点击（桌面端）
  categoryList.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.tagName === 'A' || e.target.tagName === 'a') {
      const categoryId = e.target.dataset.categoryId;
      currentCategory = categoryId;
      renderCategories();
      renderDocuments();
    }
  });
  
  // 分类点击（移动端）
  mobileCategoryList.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.tagName === 'A' || e.target.tagName === 'a') {
      const categoryId = e.target.dataset.categoryId;
      currentCategory = categoryId;
      renderCategories();
      renderDocuments();
      mobileCategoryModal.classList.add('hidden');
    }
  });
  
  // 搜索输入
  searchInput.addEventListener('input', debounce(() => {
    currentKeyword = searchInput.value;
    renderDocuments();
  }, 200));
  
  // 移动端分类菜单
  toggleCategoryBtn.addEventListener('click', () => {
    mobileCategoryModal.classList.remove('hidden');
  });
  
  closeMobileCategory.addEventListener('click', () => {
    mobileCategoryModal.classList.add('hidden');
  });
  
  // 点击蒙层关闭
  mobileCategoryModal.addEventListener('click', (e) => {
    if (e.target === mobileCategoryModal) {
      mobileCategoryModal.classList.add('hidden');
    }
  });
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), wait);
  };
}

// 复制文档信息（名称 + URL）
function copyDocInfo(button) {
  const name = button.dataset.name;
  const url = button.dataset.url;
  const textToCopy = `${name}\n${url}`;
  
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      const originalText = button.textContent;
      button.textContent = '✅ 复制成功';
      button.classList.remove('bg-green-100', 'text-green-800', 'hover:bg-green-200');
      button.classList.add('bg-green-500', 'text-white');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-500', 'text-white');
        button.classList.add('bg-green-100', 'text-green-800', 'hover:bg-green-200');
      }, 2000);
    })
    .catch(err => {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制：\n' + textToCopy);
    });
}

// 将函数挂载到window对象，使onclick可以访问
window.copyDocInfo = copyDocInfo;
