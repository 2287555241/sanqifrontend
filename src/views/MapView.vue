<template>
  <div class="map-page-container">
    <!-- 总是显示顶部导航栏 -->
    <indexHeader />
    
    <div class="main-content">
      <!-- 总是显示左侧导航菜单 -->
      <navMenu @openDataManagement="handleOpenDataManagement" />
      
      <!-- 地图容器 -->
  <div class="amap-container">
    <div v-if="loading" class="map-loading-container">
      <div class="map-loading-content">
        <el-icon class="loading-icon"><svg class="circular" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" /></svg></el-icon>
        <div class="loading-text">{{ loadingText }}</div>
      </div>
    </div>

    <div v-if="error" class="map-error-container">
      <el-card class="map-error-card">
        <div class="map-error-content">
          <div class="error-title">加载错误</div>
          <div class="error-message">{{ error }}</div>
          <el-button @click="retryLoading" type="primary">重试</el-button>
        </div>
      </el-card>
    </div>

    <div ref="mapContainer" class="map-content"></div>

        <!-- 控制栏只在非纯地图模式下显示 -->
        <div v-if="!isOnlyMapMode" class="map-controls-sidebar">
      <div class="control-panel">
        <div class="control-panel-section">
          <div class="control-panel-title">地图模式</div>
          <div class="map-style-selector">
            <div class="map-style-label">地图样式</div>
            <div class="map-style-options">
              <el-radio-group v-model="currentStyle" size="small" @change="changeMapStyle">
                <el-radio-button label="normal">标准</el-radio-button>
                <el-radio-button label="satellite">卫星</el-radio-button>
                <el-radio-button label="dark">深色</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </div>

        <div class="control-panel-section">
          <div class="control-panel-title">位置搜索</div>
          <!-- 栅格数据搜索按钮组 -->
          <div class="search-tabs">
            <div class="search-type-buttons">
              <el-button 
                :class="{ active: activeSearchType === 'cloudCover' }"
                :type="activeSearchType === 'cloudCover' ? 'primary' : ''" 
                size="small" 
                @click="activeSearchType = 'cloudCover'"
              >云量检索</el-button>
              <el-button 
                :class="{ active: activeSearchType === 'date' }"
                :type="activeSearchType === 'date' ? 'primary' : ''" 
                size="small" 
                @click="activeSearchType = 'date'"
              >日期检索</el-button>
              <el-button 
                :class="{ active: activeSearchType === 'sunElevation' }"
                :type="activeSearchType === 'sunElevation' ? 'primary' : ''" 
                size="small" 
                @click="activeSearchType = 'sunElevation'"
              >高度角检索</el-button>
              <el-button 
                :class="{ active: activeSearchType === 'combined' }"
                :type="activeSearchType === 'combined' ? 'primary' : ''" 
                size="small" 
                @click="activeSearchType = 'combined'"
              >组合检索</el-button>
            </div>
          </div>
          
          <!-- 云量检索 -->
          <div v-if="activeSearchType === 'cloudCover'" class="search-panel">
            <div class="form-item">
              <label>云量大于等于 (%)</label>
            <el-input 
                v-model="cloudCoverInput"
                size="small"
                placeholder="输入最小云量"
                class="simple-input"
                @input="handleCloudCoverInput"
                @keyup.enter="searchByCloudCover"
            >
            </el-input>
            </div>
            <el-button type="primary" @click="searchByCloudCover" class="search-btn-full">按云量查询</el-button>
          </div>
          
          <!-- 采集日期检索 -->
          <div v-if="activeSearchType === 'date'" class="search-panel">
            <div class="form-item">
              <label>开始日期</label>
              <el-date-picker
                v-model="startDate"
                type="date"
                placeholder="选择开始日期"
                format="YYYY-MM-DD"
                size="small"
                style="width: 100%"
                class="search-date-input"
              />
            </div>
            <div class="form-item">
              <label>结束日期</label>
              <el-date-picker
                v-model="endDate"
                type="date"
                placeholder="选择结束日期"
                format="YYYY-MM-DD"
                size="small"
                style="width: 100%"
                class="search-date-input"
              />
            </div>
            <el-button type="primary" @click="searchByDate" class="search-btn-full">按日期查询</el-button>
          </div>

          <!-- 太阳高度角检索 -->
          <div v-if="activeSearchType === 'sunElevation'" class="search-panel">
            <div class="form-item">
              <label>太阳高度角大于等于 (度)</label>
              <el-input
                v-model="sunElevationInput"
                size="small"
                placeholder="输入最小太阳高度角"
                class="simple-input"
                @input="handleSunElevationInput"
                @keyup.enter="searchBySunElevation"
              >
              </el-input>
              </div>
            <el-button type="primary" @click="searchBySunElevation" class="search-btn-full">按太阳高度角查询</el-button>
          </div>

          <!-- 组合检索 -->
          <div v-if="activeSearchType === 'combined'" class="search-panel">
            <div class="form-item">
              <label>云量大于等于 (%)</label>
              <el-input
                v-model="combinedCloudCoverInput"
                size="small"
                placeholder="输入最小云量"
                class="simple-input"
                @input="handleCombinedCloudCoverInput"
              >
              </el-input>
            </div>
            <div class="form-item">
              <label>开始日期</label>
              <el-date-picker
                v-model="combinedParams.startDate"
                type="date"
                placeholder="选择开始日期"
                format="YYYY-MM-DD"
                size="small"
                style="width: 100%"
                class="search-date-input"
              />
            </div>
            <div class="form-item">
              <label>结束日期</label>
              <el-date-picker
                v-model="combinedParams.endDate"
                type="date"
                placeholder="选择结束日期"
                format="YYYY-MM-DD"
                size="small"
                style="width: 100%"
                class="search-date-input"
              />
            </div>
            <div class="form-item">
              <label>太阳高度角大于等于 (度)</label>
              <el-input
                v-model="combinedSunElevationInput"
                size="small"
                placeholder="输入最小太阳高度角"
                class="simple-input"
                @input="handleCombinedSunElevationInput"
              >
              </el-input>
            </div>
            <el-button type="primary" @click="combinedSearch" class="search-btn-full">组合查询</el-button>
          </div>
          
          <!-- 查询结果 -->
          <div class="search-results-title">
            <div class="title">查询结果</div>
            <el-button type="primary" size="small" @click="refreshData" icon="Refresh">刷新</el-button>
          </div>
          
          <div class="search-results">
                <el-scrollbar>
              <el-table
                :data="rasterDataList"
                style="width: 100%"
                size="small"
                :border="false"
                :show-header="true"
                :stripe="false"
                v-loading="loading"
              >
                <el-table-column prop="id" label="ID" width="50" />
                <el-table-column prop="name" label="名称" min-width="120" show-overflow-tooltip />
                <el-table-column label="操作" width="110" fixed="right">
                  <template #default="scope">
                    <el-button type="primary" size="small" @click="viewRasterData(scope.row)">查看</el-button>
                    <el-button type="danger" size="small" @click="deleteRasterData(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-scrollbar>
          </div>
        </div>


      </div>
        </div>
      </div>
    </div>
    
    <!-- 数据管理对话框 -->
    <div 
      v-if="dataManagementDialogVisible"
      class="data-management-dialog"
      :style="{
        position: 'fixed',
        top: dialogPosition.y + 'px',
        left: dialogPosition.x + 'px',
        cursor: isDragDisabled ? 'default' : 'move'
      }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <DataManagement 
        @close="closeDataManagement" 
        @disableDrag="setDragDisabled(true)"
        @enableDrag="setDragDisabled(false)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, markRaw, computed, watch, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'
import navMenu from './navMenu.vue'
import indexHeader from './indexHeader.vue'
import DataManagement from './DataManagement.vue'
import { 
  Location, 
  Search, 
  Refresh, 
  FullScreen, 
  Close, 
  ArrowRight, 
  ArrowLeft,
  View,
  Hide,
  Minus,
  Plus
} from '@element-plus/icons-vue'
import axios from 'axios'
import { useProjectStore } from '../stores/project'
import { useUIStore } from '../stores/ui'
import { emitter, Events } from '../utils/eventBus'
import apiConfig from '../config/api'
// 不使用 AMap Loader，改为直接加载
// import AMapLoader from '@amap/amap-jsapi-loader'

// 获取路由参数
const route = useRoute()
const isOnlyMapMode = computed(() => route.query.onlyMap === 'true')
const shouldFocusYunnan = computed(() => route.query.yunnanView === 'true')

// UI状态管理
const uiStore = useUIStore()

// 数据管理对话框状态
const dataManagementDialogVisible = ref(false)
const isDragDisabled = ref(false)
const isDragging = ref(false)
const dialogPosition = ref({ 
  x: 250,
  y: 10
})
const dragOffset = ref({ x: 0, y: 0 })

// 处理打开数据管理
const handleOpenDataManagement = () => {
  dataManagementDialogVisible.value = true
}

// 关闭数据管理
const closeDataManagement = () => {
  dataManagementDialogVisible.value = false
}

// 设置拖动状态
const setDragDisabled = (disabled) => {
  isDragDisabled.value = disabled
}

// 拖动相关函数
const handleMouseDown = (e) => {
  if (e.target.closest('.el-table') || e.target.closest('.el-button')) {
    return
  }
  
  if (isDragDisabled.value) {
    return
  }

  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - dialogPosition.value.x,
    y: e.clientY - dialogPosition.value.y
  }
}

const handleMouseMove = (e) => {
  if (!isDragging.value || isDragDisabled.value) return
  
  dialogPosition.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

// 监听地图模式变化
const setupMapModeWatch = () => {
  watch(() => route.query.onlyMap, (newValue) => {
    if (!map.value) return // 如果地图未初始化，直接返回
    
    if (newValue === 'true') {
      // 清除所有覆盖物和图层
      map.value.clearMap()
      
      // 重置地图样式
      map.value.setMapStyle('amap://styles/dark')
      
      // 重置地图视图
      map.value.setStatus({
        viewMode: '2D',
        jogEnable: true,
        pitchEnable: true,
        rotateEnable: true
      })
      
      // 重置地图中心和缩放级别
      map.value.setZoomAndCenter(8, [102.8, 25.04])
      
      // 清除已有的三七区域显示
      if (sanqiPolygons.value && sanqiPolygons.value.length > 0) {
        sanqiPolygons.value.forEach(polygon => {
          if (map.value) {
            map.value.remove(polygon)
          }
        })
        sanqiPolygons.value = []
      }
    }
  })
}

const icons = {
  location: markRaw(Location),
  search: markRaw(Search),
  refresh: markRaw(Refresh),
  fullScreen: markRaw(FullScreen),
  close: markRaw(Close),
  arrowRight: markRaw(ArrowRight),
  arrowLeft: markRaw(ArrowLeft),
  view: markRaw(View),
  hide: markRaw(Hide),
  minus: markRaw(Minus),
  plus: markRaw(Plus)
}

const mapContainer = ref(null)
const map = ref(null)
const apiLoaded = ref(false)
const loading = ref(true)
const error = ref(null)
const loadingText = ref('正在加载地图...')
const retryCount = ref(0)
const maxRetries = 3
const amapKey = 'c4dd3bd3ae4716656ae2798daebe1339'
const currentStyle = ref('dark')
const satellite = ref(null)
const searchKeyword = ref('')
const searchResults = ref([])
const placeSearch = ref(null)
const currentMarker = ref(null)
const sanqiRegions = ref([])
const sanqiPolygons = ref([])
const pitch = ref(0)
const rotation = ref(0)
const activeSearchType = ref('cloudCover')
const cloudCover = ref(0)
const startDate = ref(null)
const endDate = ref(null)
const sunElevation = ref(0)
const combinedParams = reactive({
  cloudCover: 0,
  startDate: null,
  endDate: null,
  sunElevation: 0
})
const rasterDataList = ref([])

const projectStore = useProjectStore()
const currentProject = computed(() => projectStore.getCurrentProject())

let cleanupHandlers = []

// 清理地图资源的函数
const clearMap = () => {
  console.log('清理地图资源')
  
  // 移除地图上的所有图层、标记等
  if (map.value) {
    // 清除所有覆盖物和控件
    try {
      map.value.clearMap()
    } catch (e) {
      console.error('清除地图时出错:', e)
    }
  }
  
  // 执行所有注册的清理处理函数
  if (Array.isArray(cleanupHandlers)) {
    cleanupHandlers.forEach(handler => {
      try {
        if (typeof handler === 'function') {
          handler()
        }
      } catch (e) {
        console.error('执行清理处理函数时出错:', e)
      }
    })
    
    // 重置清理处理函数数组
    cleanupHandlers = []
  } else {
    console.warn('cleanupHandlers不是数组，无法执行清理函数')
    // 确保重置为数组
    cleanupHandlers = []
  }
}

// 注册清理处理函数
const registerCleanupHandler = (handler) => {
  if (typeof handler === 'function') {
    cleanupHandlers.push(handler)
  }
}

// 监听 onlyMap 参数变化
watch(isOnlyMapMode, async (newValue) => {
  if (map.value) {
    await loadSanqiRegions()
  }
})

onMounted(async () => {
  // 确保cleanupHandlers是一个数组
  cleanupHandlers = []
  
  await initializeMap()
  setupMapModeWatch() // 在地图初始化后设置监听
  
  // 监听清除地图事件
  emitter.on(Events.CLEAR_MAP, clearMap)
  
  // 添加事件监听器清理函数
  const clearEventListener = () => {
    emitter.off(Events.CLEAR_MAP, clearMap)
  }
  registerCleanupHandler(clearEventListener)
})

onBeforeUnmount(() => {
  // 移除事件监听
  emitter.off(Events.CLEAR_MAP, clearMap)
  
  // 组件卸载时清理地图资源
  try {
    clearMap()
  } catch (e) {
    console.error('清理地图资源时出错:', e)
    
    // 如果clearMap失败，手动执行清理函数
    if (Array.isArray(cleanupHandlers)) {
      cleanupHandlers.forEach(handler => {
        try {
          if (typeof handler === 'function') {
            handler()
          }
        } catch (err) {
          console.error('执行清理处理函数时出错:', err)
        }
      })
    }
  }
  
  // 确保地图实例被销毁
  if (map.value) {
    try {
      map.value.destroy();
    } catch (e) {
      console.error('销毁地图实例时出错:', e)
    }
    map.value = null;
  }
  
  // 恢复滚动
  document.body.style.overflow = 'auto';
  
  // 清空清理函数数组
  cleanupHandlers = [];
  
  console.log('地图组件已卸载，资源已清理');
})

const initializeMap = async () => {
  try {
    loading.value = true
    loadingText.value = '正在加载地图...'
    
    if (!window.AMap) {
      throw new Error('地图API未加载')
    }

    // 确保地图容器已经渲染
    if (!mapContainer.value) {
      console.error('地图容器元素未找到');
      throw new Error('地图容器元素未找到');
    }

    map.value = new AMap.Map(mapContainer.value, {
      zoom: 8,
      center: [102.8, 25.04],
      viewMode: '2D',
      pitch: 0,
      mapStyle: 'amap://styles/' + currentStyle.value,
      features: ['bg', 'road', 'point', 'label']
    })

    // 设置地图完成后的状态
    loading.value = false
    apiLoaded.value = true

    // 等待地图完全加载后再设置交互
    map.value.on('complete', async () => {
      console.log('地图实例加载完成');
      loading.value = false;
      setupMapInteraction();
      
      // 添加地图标签控制
      setupMapLabels();
      
      // 设置地图视野到云南省
      focusOnYunnan();
      
      // 加载三七种植区域数据
      await loadSanqiRegions();
      
      // 监听视角变化，确保地图始终保持不倾斜和不旋转
      map.value.on('pitch', (e) => {
        // 如果俯仰角度不为0，则重置为0
        if (map.value.getPitch() !== 0) {
          map.value.setPitch(0);
        }
      });
      
      map.value.on('rotation', (e) => {
        // 如果旋转角度不为0，则重置为0
        if (map.value.getRotation() !== 0) {
          map.value.setRotation(0);
        }
      });
    });
    
    // 只在非纯地图模式下加载三七数据
    if (!isOnlyMapMode.value) {
      await loadSanqiRegions()
    }
    
  } catch (err) {
    console.error('初始化地图失败:', err)
    error.value = '加载地图失败，请刷新页面重试'
    loading.value = false
  }
}

const initializeMapFeatures = async () => {
  try {
    // 创建行政区查询实例
    const districtSearch = new AMap.DistrictSearch({
      level: 'province',
      subdistrict: 1,
      extensions: 'all'
    });

    // 搜索云南省
    await new Promise((resolve) => {
      districtSearch.search('云南省', (status, result) => {
        if (status === 'complete' && result.districtList && result.districtList[0]) {
          handleProvinceData(result.districtList[0]);
        }
        resolve();
      });
    });

    // 初始化搜索服务
    placeSearch.value = new AMap.PlaceSearch({
      pageSize: 10,
      pageIndex: 1,
      extensions: 'all',
      city: '云南省'
    });
  } catch (error) {
    console.error('初始化地图功能失败:', error);
  }
}

const handleProvinceData = (province) => {
  try {
    // 创建省界遮罩
    if (province.boundaries) {
      const pathArray = [
        [
          new AMap.LngLat(-360, 90),
          new AMap.LngLat(-360, -90),
          new AMap.LngLat(360, -90),
          new AMap.LngLat(360, 90)
        ]
      ];
      
      province.boundaries.forEach(boundary => {
        pathArray.push(boundary);
      });

      const polygon = new AMap.Polygon({
        path: pathArray,
        strokeWeight: 1,
        strokeColor: '#2c2c2c',
        fillColor: '#1a1a1a',
        fillOpacity: 0.8,
        strokeStyle: 'solid'
      });
      map.value.add(polygon);

      // 设置地图视野
      map.value.setFitView([polygon], {
        padding: [50, 50, 50, 50]
      });

      // 限制地图范围
      const provinceBounds = new AMap.Bounds(
        [97.31833, 21.14163],
        [106.19016, 29.22041]
      );
      map.value.setLimitBounds(provinceBounds);
    }

    // 添加行政区划层
    addDistrictLayer();
  } catch (error) {
    console.error('处理省份数据失败:', error);
  }
}

const addDistrictLayer = () => {
  try {
    if (AMap.DistrictLayer && AMap.DistrictLayer.Province) {
      const districtLayer = new AMap.DistrictLayer.Province({
        zIndex: 5,
        adcode: ['530000'],
        depth: 2,
        styles: {
          'fill': () => ({
            color: '#2c2c2c1a',
            borderColor: '#3c3c3c',
            borderWidth: 1,
            borderType: 'solid'
          }),
          'province-stroke': () => ({
            color: '#3c3c3c',
            width: 1.5
          }),
          'city-stroke': () => ({
            color: '#2c2c2c',
            width: 1
          }),
          'county-stroke': () => ({
            color: '#1a1a1a',
            width: 0.5
          })
        }
      });
      districtLayer.setMap(map.value);
    }
  } catch (error) {
    console.error('添加行政区划层失败:', error);
  }
}

const initAMap = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    console.log('开始初始化高德地图');
    
    // 添加安全配置
    window._AMapSecurityConfig = {
      securityJsCode: '您的安全密钥',  // 如果有安全密钥，请替换
      serviceHost: 'https://a.amap.com'  // 指定服务主机
    };
    
    // 尝试加载AMap
    const AMap = await loadAMap();
    console.log('高德地图API加载成功:', AMap);
    
    loadingText.value = '正在初始化地图...';
    await initMap();
  } catch (error) {
    console.error('初始化高德地图失败:', error);
    handleError(error);
  }
};

const loadAMap = async () => {
  return new Promise((resolve, reject) => {
    // 如果已经加载过，直接返回
    if (window.AMap) {
      console.log('AMap已加载，直接返回');
      resolve(window.AMap);
      return;
    }

    try {
      console.log('开始加载AMap...');
      
      // 清理之前可能存在的脚本
      const existingScripts = document.querySelectorAll('script[src*="webapi.amap.com"]');
      existingScripts.forEach(script => {
        script.parentNode.removeChild(script);
      });
      
      // 创建新的脚本元素
      const script = document.createElement('script');
      script.type = 'text/javascript';
      // 不使用callback参数，改用onload事件
      script.src = 'https://webapi.amap.com/maps?v=2.0&key=c4dd3bd3ae4716656ae2798daebe1339&plugin=AMap.Scale,AMap.ToolBar,AMap.DistrictSearch,AMap.PlaceSearch,AMap.DistrictLayer,AMap.Buildings';
      
      // 设置加载超时
      const timeout = setTimeout(() => {
        console.error('AMap加载超时');
        reject(new Error('AMap加载超时'));
      }, 20000);
      
      // 加载成功回调
      script.onload = () => {
        clearTimeout(timeout);
        console.log('AMap脚本加载完成');
        
        // 验证AMap对象是否存在
        if (window.AMap) {
          console.log('AMap对象已成功创建');
          resolve(window.AMap);
        } else {
          console.error('AMap脚本已加载，但AMap对象未创建');
          reject(new Error('AMap加载失败：对象未创建'));
        }
      };
      
      // 加载失败回调
      script.onerror = () => {
        clearTimeout(timeout);
        console.error('AMap脚本加载失败');
        reject(new Error('AMap加载失败：脚本加载错误'));
      };
      
      // 添加到文档
      document.head.appendChild(script);
      console.log('AMap脚本已添加到文档');
    } catch (error) {
      console.error('加载AMap时发生错误:', error);
      reject(error);
    }
  });
};

const initMap = async () => {
  try {
    console.log('开始创建地图实例');
    // 确保 AMap 已加载
    await loadAMap();
    
    if (!window.AMap) {
      throw new Error('AMap 全局对象不存在，API可能未正确加载');
    }

    console.log('开始创建地图实例，AMap对象已就绪');
    
    const mapOptions = {
      zoom: 8, // 默认放大到8级，显示整个云南省
      center: [102.8, 25.04], // 云南省中心位置
      mapStyle: 'amap://styles/dark',
      viewMode: '3D',
      skyColor: '#1a1a1a',
      features: ['bg', 'road', 'point', 'building', 'label'], // building必须有
      showBuildingBlock: true, // 开启3D楼块
      rotateEnable: false, // 禁用旋转功能
      pitchEnable: false, // 禁用倾斜功能
      dragEnable: true,
      keyboardEnable: true,
      doubleClickZoom: true,
      zoomEnable: true,
      preloadMode: true,
      cacheSize: 1000,
      expandZoomRange: true,
      zooms: [6, 20],
      defaultCursor: 'grab',
      touchZoom: true,
      touchZoomCenter: 1,
      jogEnable: true,
      backgroundColor: '#1a1a1a',
      labelzIndex: 100,
      labelRejectMask: false,
      labelCollision: false,
      pitch: 0, // 将初始俯仰角设为0
      rotation: 0 // 将初始旋转角设为0
    };

    // 确保容器元素存在
    if (!mapContainer.value) {
      throw new Error('地图容器元素不存在');
    }

    console.log('创建地图实例，容器:', mapContainer.value);
    map.value = new AMap.Map(mapContainer.value, mapOptions);

    // 添加地图加载完成的事件监听
    map.value.on('complete', () => {
      console.log('地图实例加载完成');
      loading.value = false;
      setupMapInteraction();
      
      // 添加地图标签控制
      setupMapLabels();
      
      // 设置地图视野到云南省
      focusOnYunnan();
      
      // 监听视角变化，确保地图始终保持不倾斜和不旋转
      map.value.on('pitch', (e) => {
        // 如果俯仰角度不为0，则重置为0
        if (map.value.getPitch() !== 0) {
          map.value.setPitch(0);
        }
      });
      
      map.value.on('rotation', (e) => {
        // 如果旋转角度不为0，则重置为0
        if (map.value.getRotation() !== 0) {
          map.value.setRotation(0);
        }
      });
    });

    // 添加错误处理
    map.value.on('error', (error) => {
      console.error('地图加载错误:', error);
      loading.value = false;
    });

  } catch (error) {
    console.error('初始化地图失败:', error);
    loading.value = false;
    throw error;
  }
}

// 设置地图视野到云南省
const focusOnYunnan = () => {
  try {
    // 云南省的大致边界范围
    const yunnanBounds = new AMap.Bounds(
      [97.31833, 21.14163],  // 西南角
      [106.19016, 29.22041]  // 东北角
    );
    
    // 调整视野范围
    map.value.setBounds(yunnanBounds);
    
    // 设置俯视角度为0，确保地图不倾斜
    map.value.setPitch(0);
    
    // 设置旋转角度为0，确保地图不旋转
    map.value.setRotation(0);
    
    console.log('地图视野已设置到云南省，并已复原俯仰和旋转');
  } catch (error) {
    console.error('设置地图视野到云南省失败:', error);
  }
}

// 加载三七种植区域数据
const loadSanqiRegions = async () => {
  try {
    loadingText.value = '正在加载区域数据...';
    console.log('开始加载三七种植区域数据');
    
    // 清除旧的多边形
    if (sanqiPolygons.value.length > 0) {
      map.value.remove(sanqiPolygons.value);
      sanqiPolygons.value = [];
    }
    
    // 在纯地图模式下不加载数据
    if (isOnlyMapMode.value) {
      console.log('纯地图模式，跳过加载三七区域数据');
      return;
    }
    
    let response;
    try {
      // 先尝试从常规API获取数据
      console.log('尝试从常规API获取三七数据');
      response = await axios.get(apiConfig.sanqi.regions);
      console.log('成功获取三七区域数据:', response.data);
    } catch (apiError) {
      console.error('从常规API获取数据失败，尝试使用测试API:', apiError);
      
      try {
        // 如果常规API失败，则尝试使用测试API
        response = await axios.get(apiConfig.sanqi.test);
        console.log('从测试API获取三七数据成功:', response.data);
      } catch (testApiError) {
        console.error('从测试API获取数据也失败:', testApiError);
        
        // 创建一些本地测试数据作为最后的备选方案
        console.log('使用本地硬编码的测试数据');
        response = {
          data: {
            success: true,
            data: [
              {
                gid: 1,
                name: '昆明市',
                geom_text: 'POLYGON((102.5 25.0, 102.6 25.0, 102.6 25.1, 102.5 25.1, 102.5 25.0))'
              },
              {
                gid: 2,
                name: '曲靖市',
                geom_text: 'POLYGON((103.5 25.5, 103.7 25.5, 103.7 25.7, 103.5 25.7, 103.5 25.5))'
              },
              {
                gid: 3,
                name: '昭通市',
                geom_text: 'POLYGON((104.0 27.0, 104.2 27.0, 104.2 27.2, 104.0 27.2, 104.0 27.0))'
              },
              {
                gid: 4,
                name: '玉溪市',
                geom_text: 'POLYGON((102.4 24.2, 102.6 24.2, 102.6 24.4, 102.4 24.4, 102.4 24.2))'
              },
              {
                gid: 5,
                name: '红河哈尼族彝族自治州',
                geom_text: 'POLYGON((103.0 23.0, 103.4 23.0, 103.4 23.4, 103.0 23.4, 103.0 23.0))'
              },
              {
                gid: 6,
                name: '文山壮族苗族自治州',
                geom_text: 'POLYGON((104.0 23.5, 104.5 23.5, 104.5 24.0, 104.0 24.0, 104.0 23.5))'
              }
            ]
          }
        };
      }
    }
    
    sanqiRegions.value = response.data;
    
    // 显示三七区域
    renderSanqiRegions();
  } catch (error) {
    console.error('加载三七种植区域数据失败:', error);
    // 不要中断整个地图显示
    error.value = `加载三七区域数据失败: ${error.message || '未知错误'}`;
    setTimeout(() => {
      error.value = null;
    }, 5000);
  }
}

// 渲染三七区域
const renderSanqiRegions = () => {
  if (!map.value || !sanqiRegions.value) {
    console.error('无法渲染三七区域: 地图或数据不存在');
    return;
  }
  
  console.log(`开始渲染三七区域数据`, sanqiRegions.value);
  
  try {
    // 处理数据结构，支持直接的数组格式
    const regions = Array.isArray(sanqiRegions.value.data) 
      ? sanqiRegions.value.data 
      : (Array.isArray(sanqiRegions.value) ? sanqiRegions.value : []);
    
    console.log(`找到 ${regions.length} 个三七区域`);
    
    // 为每个区域创建多边形
    regions.forEach(region => {
      try {
        // 获取名称和ID
        const name = region.name || '未命名区域';
        const id = region.gid || '无ID';
      
        console.log(`处理区域: ${name}(ID:${id})`);
        
        // 解析几何数据
        const geomData = region.geom || region.geom_text;
        const path = decodeGeometry(geomData);
        
        if (path && path.length > 0) {
        // 创建多边形对象
        const polygon = new AMap.Polygon({
            path: path,
          strokeColor: '#4CAF50',
          strokeWeight: 2,
          strokeOpacity: 0.8,
          fillColor: '#81C784',
          fillOpacity: 0.4,
          cursor: 'pointer',
          extData: {
              id: id,
              name: name
          }
        });
        
        // 添加点击事件
        polygon.on('click', () => {
            console.log('区域信息:', region);
            // 显示详细信息窗口
          const infoWindow = new AMap.InfoWindow({
            content: `<div style="padding:10px;">
                          <h3>${name}</h3>
                          <p>ID: ${id}</p>
                      </div>`,
            offset: new AMap.Pixel(0, -30)
          });
          
          infoWindow.open(map.value, polygon.getBounds().getCenter());
        });
        
        // 将多边形添加到地图
        map.value.add(polygon);
        sanqiPolygons.value.push(polygon);
        } else {
          console.warn(`区域 ${name} 的几何数据无效`);
        }
      } catch (e) {
        console.error('创建多边形失败:', e, region);
      }
    });
    
    console.log(`成功渲染 ${sanqiPolygons.value.length} 个三七区域`);
    
    // 调整视图以显示所有区域
    if (sanqiPolygons.value.length > 0) {
      map.value.setFitView(sanqiPolygons.value);
    }
    
  } catch (error) {
    console.error('渲染三七区域失败:', error);
  }
}

// 解码几何数据的函数
const decodeGeometry = (geomStr) => {
  try {
    console.log('处理几何数据:', geomStr);
    let geom = geomStr;
    
    // 检查字段名称，某些情况下可能使用geom_text
    if (!geom && typeof geomStr === 'object') {
      geom = geomStr.geom_text || geomStr.geom;
    }
    
    if (!geom || typeof geom !== 'string') {
      console.error('无效的几何数据:', geomStr);
      return getDefaultPolygon();
    }
    
    // 尝试解析WKT格式的几何数据
    if (geom.startsWith('POLYGON') || geom.startsWith('MULTIPOLYGON')) {
      return parseWKT(geom);
    } 
    
    // 如果是其他格式（如WKB Hex），或无法识别的数据
    console.warn('未知的几何数据格式:', geom);
    return getDefaultPolygon();
  } catch (e) {
    console.error('解析几何数据失败:', e);
    return getDefaultPolygon(); 
  }
}

// 解析WKT格式的几何数据
const parseWKT = (wkt) => {
  try {
    let coordsText = '';
    
    if (wkt.startsWith('POLYGON')) {
      // 从POLYGON((x1 y1, x2 y2, ...))中提取坐标
      coordsText = wkt.substring(wkt.indexOf('((') + 2, wkt.indexOf('))'));
      
      // 解析坐标对
      const coordPairs = coordsText.split(',').map(pair => pair.trim());
      return coordPairs.map(pair => {
        const [lng, lat] = pair.split(' ').map(Number);
        return new AMap.LngLat(lng, lat);
      });
    } 
    else if (wkt.startsWith('MULTIPOLYGON')) {
      // 解析第一个多边形 MULTIPOLYGON(((x1 y1, x2 y2, ...)), (...))
      coordsText = wkt.substring(wkt.indexOf('(((') + 3);
      coordsText = coordsText.substring(0, coordsText.indexOf(')))'));
      
      // 解析坐标对
      const coordPairs = coordsText.split(',').map(pair => pair.trim());
      return coordPairs.map(pair => {
        const [lng, lat] = pair.split(' ').map(Number);
        return new AMap.LngLat(lng, lat);
      });
    }
    
    console.warn('不支持的WKT几何类型:', wkt);
    return getDefaultPolygon();
  } catch (e) {
    console.error('解析WKT数据失败:', e);
    return getDefaultPolygon();
  }
}

// 返回默认的多边形（作为错误处理的回退方案）
const getDefaultPolygon = () => {
  // 简化处理，假设数据是直接的坐标点列表
  // 云南省的大致坐标范围
  return [
    new AMap.LngLat(102.5, 25.0),  // 大致在昆明附近
    new AMap.LngLat(102.6, 25.0),
    new AMap.LngLat(102.6, 25.1),
    new AMap.LngLat(102.5, 25.1)
  ];
}

// 设置地图交互
const setupMapInteraction = () => {
  if (!map.value || !mapContainer.value) {
    console.error('地图或容器元素未初始化，无法设置交互');
    return;
  }

  try {
    // 禁止地图默认的右键菜单
    map.value.on('rightclick', (e) => {
      // 不使用originalEvent，直接阻止事件冒泡
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      // 防止事件冒泡
      return false;
    });

    // 监听鼠标滚轮按下拖动事件
    let isRightMouseDown = false;
    let lastX = 0;
    let lastY = 0;

    // 监听DOM元素上的鼠标事件
    const mapContainerElement = mapContainer.value;
    if (!mapContainerElement) {
      console.error('地图容器元素未找到');
      return;
    }

    // 禁用默认的右键菜单
    mapContainerElement.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    mapContainerElement.addEventListener('mousedown', (e) => {
      if (e.button === 1) { // 中键
        isRightMouseDown = true;
        lastX = e.clientX;
        lastY = e.clientY;
        e.preventDefault();
      }
    });

    mapContainerElement.addEventListener('mousemove', (e) => {
      if (isRightMouseDown && map.value) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;

        try {
          // 调整旋转角度
          const currentRotation = map.value.getRotation() || 0;
          map.value.setRotation(currentRotation + deltaX * 0.5);

          // 调整俯仰角度
          const currentPitch = map.value.getPitch() || 0;
          const newPitch = currentPitch - deltaY * 0.5;
          // 限制俯仰角度在0-80度之间
          map.value.setPitch(Math.min(Math.max(newPitch, 0), 80));

          // 更新界面上的滑块值
          rotation.value = map.value.getRotation() || 0;
          pitch.value = map.value.getPitch() || 0;
        } catch (err) {
          console.error('拖动调整视角失败:', err);
        }

        lastX = e.clientX;
        lastY = e.clientY;
      }
    });

    // 监听全局的鼠标抬起事件，确保释放鼠标
    const handleMouseUp = (e) => {
      if (e.button === 1) {
        isRightMouseDown = false;
      }
    };
    
    window.addEventListener('mouseup', handleMouseUp);
    
    // 组件销毁时移除事件监听
    const cleanup = () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    // 将清理函数添加到数组中，而不是覆盖整个变量
    cleanupHandlers.push(cleanup);

    console.log('地图交互设置完成');
  } catch (error) {
    console.error('设置地图交互失败:', error);
  }
}

// 切换地图样式
const changeMapStyle = (style) => {
  if (!map.value) return;
  
  try {
    console.log('切换地图样式:', style);
    
    // 移除卫星图层
    if (satellite.value) {
      satellite.value.setMap(null);
    }

    switch (style) {
      case 'normal':
        map.value.setMapStyle('amap://styles/normal');
        break;
      case 'satellite':
        // 先设置为标准样式
        map.value.setMapStyle('amap://styles/normal');
        // 添加卫星图层
        if (satellite.value) {
          satellite.value.setMap(map.value);
        } else {
          console.error('卫星图层未初始化');
          satellite.value = new AMap.TileLayer.Satellite();
          satellite.value.setMap(map.value);
        }
        break;
      case 'dark':
        map.value.setMapStyle('amap://styles/dark');
        break;
    }
    console.log('地图样式切换成功:', style);
  } catch (error) {
    console.error('切换地图样式失败:', error);
    currentStyle.value = map.value.getMapStyle() || 'normal';
  }
}

const handleError = (error) => {
  loading.value = false;
  const errorMsg = error.message || '未知错误';
  console.error('地图错误详情:', {
    message: errorMsg,
    stack: error.stack,
    error: error
  });
  
  // 减少重试间隔
  const retryInterval = errorMsg.includes('超时') ? 3000 : 1500;
  
  if (retryCount.value < maxRetries) {
    error.value = errorMsg + '，正在重试 (' + (retryCount.value + 1) + '/' + maxRetries + ')...';
    retryCount.value++;
    console.log(`尝试重新加载地图，重试次数: ${retryCount.value}，等待 ${retryInterval/1000} 秒`);
    
    setTimeout(() => {
      // 清除可能存在的旧的AMap对象
      if (window.AMap) {
        console.log('清除旧的AMap对象');
        delete window.AMap;
      }
      
      // 重新加载地图脚本 - 加载必要的插件
      const oldScript = document.querySelector('script[src*="webapi.amap.com"]');
      if (oldScript) {
        oldScript.remove();
      }
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://webapi.amap.com/maps?v=2.0&key=c4dd3bd3ae4716656ae2798daebe1339&plugin=AMap.Scale,AMap.ToolBar,AMap.DistrictSearch,AMap.PlaceSearch,AMap.DistrictLayer';
      script.async = true;
      document.head.appendChild(script);
      
      initAMap();
    }, retryInterval);
  } else {
    error.value = errorMsg + '，请刷新页面重试';
    console.error('重试次数已达上限，停止自动重试');
  }
}

const retryLoading = () => {
  retryCount.value = 0;
  initAMap();
}

// 添加搜索相关方法
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }

  if (!placeSearch.value) {
    ElMessage.error('搜索服务未初始化');
    return;
  }

  try {
    searchResults.value = [];
    await new Promise((resolve, reject) => {
      placeSearch.value.search(searchKeyword.value, (status, result) => {
        if (status === 'complete' && result.info === 'OK') {
          searchResults.value = result.poiList.pois;
          resolve();
        } else {
          ElMessage.error('搜索失败：' + result.info);
          reject(new Error(result.info));
        }
      });
    });
  } catch (error) {
    console.error('搜索出错：', error);
    ElMessage.error('搜索服务出错');
  }
}

const handleSelectLocation = (item) => {
  // 清除之前的标记
  if (currentMarker.value) {
    map.value.remove(currentMarker.value);
  }

  // 创建新的标记
  currentMarker.value = new AMap.Marker({
    position: [item.location.lng, item.location.lat],
    title: item.name,
    animation: 'AMAP_ANIMATION_DROP'
  });

  // 将标记添加到地图
  map.value.add(currentMarker.value);
  
  // 平滑移动到选中位置
  map.value.setZoomAndCenter(15, [item.location.lng, item.location.lat], false, 1000);

  // 清空搜索结果
  searchResults.value = [];
}

// 设置地图标签
const setupMapLabels = () => {
  if (!map.value) return;

  try {
    // 创建行政区查询实例
    const districtSearch = new AMap.DistrictSearch({
      level: 'district',
      subdistrict: 1
    });

    // 搜索云南省
    districtSearch.search('云南省', (status, result) => {
      if (status === 'complete' && result.districtList && result.districtList[0]) {
        const province = result.districtList[0];
        
        // 添加省级标签
        addDistrictLabel(province, 'province');
        
        // 添加市级标签
        if (province.districtList) {
          province.districtList.forEach(city => {
            addDistrictLabel(city, 'city');
            
            // 添加区县级标签
            if (city.districtList) {
              city.districtList.forEach(district => {
                addDistrictLabel(district, 'district');
              });
            }
          });
        }
      }
    });
  } catch (error) {
    console.error('设置地图标签失败:', error);
  }
}

// 添加行政区标签
const addDistrictLabel = (district, level) => {
  if (!map.value || !district || !district.center) return;

  try {
    const center = district.center;
    const name = district.name;
    
    // 根据级别设置不同的样式
    let fontSize, offset;
    switch (level) {
      case 'province':
        fontSize = 16;
        offset = new AMap.Pixel(0, -10);
        break;
      case 'city':
        fontSize = 14;
        offset = new AMap.Pixel(0, -8);
        break;
      case 'district':
        fontSize = 12;
        offset = new AMap.Pixel(0, -6);
        break;
      default:
        fontSize = 12;
        offset = new AMap.Pixel(0, -6);
    }

    // 创建文本标记
    const textMarker = new AMap.Text({
      text: name,
      position: center,
      offset: offset,
      style: {
        fontSize: fontSize,
        fontWeight: 'bold',
        fillColor: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 2,
        padding: '5px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: '3px'
      },
      zIndex: 100
    });

    // 将文本标记添加到地图
    map.value.add(textMarker);
  } catch (error) {
    console.error('添加行政区标签失败:', error);
  }
}

// 云量增减函数
const increaseCloud = () => {
  if (cloudCover.value === null) {
    cloudCover.value = 0
  }
  cloudCover.value = Math.min(100, cloudCover.value + 1)
}

const decreaseCloud = () => {
  if (cloudCover.value === null) {
    cloudCover.value = 0
    return
  }
  cloudCover.value = Math.max(0, cloudCover.value - 1)
}

// 太阳高度角增减函数
const increaseSunElevation = () => {
  if (sunElevation.value === null) {
    sunElevation.value = 0
  }
  sunElevation.value = Math.min(90, sunElevation.value + 1)
}

const decreaseSunElevation = () => {
  if (sunElevation.value === null) {
    sunElevation.value = 0
    return
  }
  sunElevation.value = Math.max(0, sunElevation.value - 1)
}

// 按云量查询
const searchByCloudCover = async () => {
  loading.value = true
  
  try {
    const params = {}
    if (cloudCover.value !== null) {
      params.min = cloudCover.value
    }
    
    const response = await axios.get(apiConfig.raster.search.cloudCover, { params })
    
    if (response.data.success) {
      rasterDataList.value = response.data.data || []
      if (rasterDataList.value.length === 0) {
        ElMessage.info('没有找到符合条件的栅格数据')
      }
    } else {
      ElMessage.error(response.data.error || '查询失败')
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error(error.message || '查询失败')
  } finally {
    loading.value = false
  }
}

// 按采集日期查询
const searchByDate = async () => {
  loading.value = true
  
  try {
    const params = {}
    if (startDate.value) {
      params.startDate = formatDate(startDate.value)
    }
    if (endDate.value) {
      params.endDate = formatDate(endDate.value)
    }
    
    const response = await axios.get(apiConfig.raster.search.date, { params })
    
    if (response.data.success) {
      rasterDataList.value = response.data.data || []
      if (rasterDataList.value.length === 0) {
        ElMessage.info('没有找到符合条件的栅格数据')
      }
    } else {
      ElMessage.error(response.data.error || '查询失败')
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error(error.message || '查询失败')
  } finally {
    loading.value = false
  }
}

// 按太阳高度角查询
const searchBySunElevation = async () => {
  loading.value = true
  
  try {
    const params = {}
    if (sunElevation.value !== null) {
      params.min = sunElevation.value
    }
    
    const response = await axios.get(apiConfig.raster.search.sunElevation, { params })
    
    if (response.data.success) {
      rasterDataList.value = response.data.data || []
      if (rasterDataList.value.length === 0) {
        ElMessage.info('没有找到符合条件的栅格数据')
      }
    } else {
      ElMessage.error(response.data.error || '查询失败')
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error(error.message || '查询失败')
  } finally {
    loading.value = false
  }
}

// 组合查询
const combinedSearch = async () => {
  loading.value = true
  
  try {
    const params = {}
    if (combinedParams.cloudCover !== null) {
      params.cloudCover = combinedParams.cloudCover
    }
    if (combinedParams.startDate) {
      params.startDate = formatDate(combinedParams.startDate)
    }
    if (combinedParams.endDate) {
      params.endDate = formatDate(combinedParams.endDate)
    }
    if (combinedParams.sunElevation !== null) {
      params.sunElevation = combinedParams.sunElevation
    }
    
    const response = await axios.get(apiConfig.raster.search.combined, { params })
    
    if (response.data.success) {
      rasterDataList.value = response.data.data || []
      if (rasterDataList.value.length === 0) {
        ElMessage.info('没有找到符合条件的栅格数据')
      }
    } else {
      ElMessage.error(response.data.error || '查询失败')
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error(error.message || '查询失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据列表
const refreshData = async () => {
  loading.value = true
  
  try {
    const response = await axios.get(apiConfig.raster.list)
    
    if (response.data.success) {
      rasterDataList.value = response.data.data || []
      if (rasterDataList.value.length === 0) {
        ElMessage.info('暂无数据')
      }
    } else {
      ElMessage.error(response.data.error || '加载数据失败')
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

// 查看栅格数据
const viewRasterData = (data) => {
  ElMessage.info(`查看栅格数据: ${data.name}`)
  // 这里可以添加查看栅格数据的逻辑
}

// 删除栅格数据
const deleteRasterData = (data) => {
  ElMessageBox.confirm(`确定要删除 ${data.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.delete(apiConfig.raster.delete(data.id))
      
      if (response.data.success) {
        ElMessage.success('删除成功')
        refreshData() // 重新加载数据列表
      } else {
        ElMessage.error(response.data.error || '删除失败')
      }
    } catch (error) {
      console.error('Error:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 格式化日期函数
const formatDate = (date) => {
  if (!date) return null
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// 初始化数据
onMounted(() => {
  // 预加载数据
  refreshData()
})

// 导出清理和注册函数，供其他组件使用
defineExpose({
  clearMap,
  registerCleanupHandler
});

// 云量输入框的值
const cloudCoverInput = ref('');

// 处理云量输入
const handleCloudCoverInput = (value) => {
  // 移除非数字和小数点
  let cleaned = value.replace(/[^\d.]/g, '');
  
  // 确保只有一个小数点
  const dotIndex = cleaned.indexOf('.');
  if (dotIndex !== -1) {
    const beforeDot = cleaned.substring(0, dotIndex + 1);
    const afterDot = cleaned.substring(dotIndex + 1).replace(/\./g, '');
    cleaned = beforeDot + afterDot;
  }
  
  // 限制小数点后两位
  if (dotIndex !== -1 && cleaned.length > dotIndex + 3) {
    cleaned = cleaned.substring(0, dotIndex + 3);
  }
  
  // 限制最大值为100
  const numValue = parseFloat(cleaned);
  if (numValue > 100) {
    cleaned = '100';
  }
  
  // 更新显示值和实际值
  cloudCoverInput.value = cleaned;
  cloudCover.value = cleaned === '' ? null : parseFloat(cleaned);
};

// 太阳高度角输入框的值
const sunElevationInput = ref('');

// 处理太阳高度角输入
const handleSunElevationInput = (value) => {
  // 移除非数字和小数点
  let cleaned = value.replace(/[^\d.]/g, '');
  
  // 确保只有一个小数点
  const dotIndex = cleaned.indexOf('.');
  if (dotIndex !== -1) {
    const beforeDot = cleaned.substring(0, dotIndex + 1);
    const afterDot = cleaned.substring(dotIndex + 1).replace(/\./g, '');
    cleaned = beforeDot + afterDot;
  }
  
  // 限制小数点后两位
  if (dotIndex !== -1 && cleaned.length > dotIndex + 3) {
    cleaned = cleaned.substring(0, dotIndex + 3);
  }
  
  // 限制最大值为90
  const numValue = parseFloat(cleaned);
  if (numValue > 90) {
    cleaned = '90';
  }
  
  // 更新显示值和实际值
  sunElevationInput.value = cleaned;
  sunElevation.value = cleaned === '' ? null : parseFloat(cleaned);
};

// 组合检索中的云量输入框的值
const combinedCloudCoverInput = ref('');

// 处理组合检索中的云量输入
const handleCombinedCloudCoverInput = (value) => {
  // 移除非数字和小数点
  let cleaned = value.replace(/[^\d.]/g, '');
  
  // 确保只有一个小数点
  const dotIndex = cleaned.indexOf('.');
  if (dotIndex !== -1) {
    const beforeDot = cleaned.substring(0, dotIndex + 1);
    const afterDot = cleaned.substring(dotIndex + 1).replace(/\./g, '');
    cleaned = beforeDot + afterDot;
  }
  
  // 限制小数点后两位
  if (dotIndex !== -1 && cleaned.length > dotIndex + 3) {
    cleaned = cleaned.substring(0, dotIndex + 3);
  }
  
  // 限制最大值为100
  const numValue = parseFloat(cleaned);
  if (numValue > 100) {
    cleaned = '100';
  }
  
  // 更新显示值和实际值
  combinedCloudCoverInput.value = cleaned;
  combinedParams.cloudCover = cleaned === '' ? null : parseFloat(cleaned);
};

// 组合检索中的太阳高度角输入框的值
const combinedSunElevationInput = ref('');

// 处理组合检索中的太阳高度角输入
const handleCombinedSunElevationInput = (value) => {
  // 移除非数字和小数点
  let cleaned = value.replace(/[^\d.]/g, '');
  
  // 确保只有一个小数点
  const dotIndex = cleaned.indexOf('.');
  if (dotIndex !== -1) {
    const beforeDot = cleaned.substring(0, dotIndex + 1);
    const afterDot = cleaned.substring(dotIndex + 1).replace(/\./g, '');
    cleaned = beforeDot + afterDot;
  }
  
  // 限制小数点后两位
  if (dotIndex !== -1 && cleaned.length > dotIndex + 3) {
    cleaned = cleaned.substring(0, dotIndex + 3);
  }
  
  // 限制最大值为90
  const numValue = parseFloat(cleaned);
  if (numValue > 90) {
    cleaned = '90';
  }
  
  // 更新显示值和实际值
  combinedSunElevationInput.value = cleaned;
  combinedParams.sunElevation = cleaned === '' ? null : parseFloat(cleaned);
};
</script>

<style scoped>
.map-page-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden; /* 确保地图页面不会滚动 */
}

.main-content {
  display: flex;
  flex: 1;
  height: calc(100vh - 30px); /* 调整为与头部导航栏高度一致 */
  overflow: hidden;
  position: relative;
}

.amap-container {
  flex: 1;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
}

.map-content {
  width: 100%;
  height: 100%;
  background: #2c2c2c;
}

.left-sidebar {
  width: 200px;
  height: 100%;
  background: rgba(44, 44, 44, 0.9);
  z-index: 2;
  padding-top: 30px;
}

/* 隐藏高德地图左下角logo和版权信息 */
:deep(.amap-logo) {
  display: none !important;
  opacity: 0 !important;
}

:deep(.amap-copyright) {
  display: none !important;
  opacity: 0 !important;
}

.map-controls-sidebar {
  position: absolute;
  top: 30px; /* 与头部导航栏高度一致 */
  right: 0;
  bottom: 0;
  z-index: 90;
  pointer-events: none; /* 防止拦截地图事件 */
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  width: 280px; /* 减小宽度 */
}

.control-panel {
  width: 100%;
  background-color: #1a1a1a; /* 完全不透明 */
  color: #fff;
  pointer-events: auto; /* 恢复指针事件 */
  overflow-y: hidden; /* 改为hidden避免滚动条 */
  padding: 20px 15px; /* 减小内边距 */
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 15px; /* 减小间距 */
  border-radius: 0;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
}

.control-panel-section:first-child {
  padding-top: 0;
}

.control-panel-section {
  margin-bottom: 0;
  padding-bottom: 15px; /* 减小内边距 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.control-panel-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
  flex: 1; /* 让最后一个section占据剩余空间 */
  display: flex;
  flex-direction: column;
}

.control-panel-title {
  font-size: 14px; /* 减小字体大小 */
  font-weight: 500;
  color: #fff;
  margin-bottom: 12px; /* 减小下边距 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding-left: 12px;
}

.control-panel-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background: #409EFF;
  border-radius: 2px;
}

.control-panel-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px;
  border-radius: 4px;
  transition: all 0.3s ease;
  background: #232323; /* 完全不透明 */
  border: 1px solid #2c2c2c; /* 添加边框 */
}

.control-panel-item:hover {
  background: #2a2a2a; /* 完全不透明的悬停颜色 */
}

.control-panel-item span {
  font-size: 14px;
}

/* 自定义El-radio-group样式 */
/* 地图样式选择器 */
.map-style-selector {
  margin-bottom: 12px;
}

.map-style-label {
  font-size: 12px;
  color: #b8b8b8;
  margin-bottom: 6px;
}

.map-style-options {
  display: flex;
  justify-content: center;
}

.map-style-options :deep(.el-radio-group) {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  width: 100%;
}

.map-style-options :deep(.el-radio-button) {
  flex: 1;
}

.map-style-options :deep(.el-radio-button__inner) {
  background-color: #2c2c2c; /* 完全不透明 */
  border-color: #444; /* 不透明边框 */
  color: #fff;
  padding: 6px 8px;
  font-size: 12px;
  height: 28px;
  line-height: 1;
  transition: all 0.2s ease;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
}

.map-style-options :deep(.el-radio-button__inner:hover) {
  background-color: #3c3c3c; /* 不透明悬停背景 */
}

.map-style-options :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #409EFF;
  border-color: #409EFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 自定义El-switch样式 */
.control-panel-item :deep(.el-switch__core) {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.control-panel-item :deep(.el-switch.is-checked .el-switch__core) {
  background-color: #409EFF;
  border-color: #409EFF;
}

.search-box {
  margin-bottom: 12px;
  width: 100%;
  flex: 0;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  background-color: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none !important;
  border: none;
}

.search-input {
  background-color: #2c2c2c; /* 完全不透明 */
  border-radius: 4px;
  border: 1px solid #3c3c3c; /* 不透明边框 */
  padding: 0 12px;
  transition: all 0.3s ease;
  height: 40px;
  display: flex;
  align-items: center;
}

.search-input:hover {
  border-color: #4c4c4c; /* 不透明悬停边框 */
}

.search-input:focus-within {
  border-color: #409EFF;
  box-shadow: 0 0 0 1px #3080c8; /* 不透明阴影 */
}

.search-input :deep(.el-input__inner) {
  color: #fff;
  height: 38px;
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
  text-align: left;
  padding-left: 0;
}

.search-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

.search-btn {
  border: none;
  background: transparent;
  color: #409EFF;
  padding: 0 8px;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover {
  color: #79bbff;
}

.search-results {
  height: 220px; /* 减小高度 */
  overflow: hidden;
  background-color: #1a1a1a;
  border: 1px solid #ffffff; /* 修改为白色边框 */
  border-radius: 4px;
  position: relative;
}

/* 隐藏所有内部边框的通用方法 */
.search-results * {
  border-color: transparent !important;
}

.search-results :deep(.el-scrollbar) {
  height: 100%;
}

/* 隐藏滚动条 */
.search-results :deep(.el-scrollbar__bar) {
  display: none !important;
}

.search-results :deep(.el-table) {
  background-color: transparent !important;
  color: #e6e6e6 !important;
  font-size: 12px !important;
  border: none !important; /* 移除表格自身的边框 */
}

.search-results :deep(.el-table__header) {
  border-bottom: none !important; /* 移除表头底部边框 */
}

.search-results :deep(.el-table__header-wrapper) {
  border: none !important;
}

.search-results :deep(.el-table__header-wrapper th) {
  background-color: #2c2c2c !important;
  color: #e6e6e6 !important;
  border: none !important; /* 移除表头单元格边框 */
  padding: 4px 0 !important;
  height: 32px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
}

.search-results :deep(.el-table__body-wrapper) {
  border: none !important;
}

.search-results :deep(.el-table__body-wrapper td) {
  background-color: #1a1a1a !important;
  color: #e6e6e6 !important;
  border: none !important; /* 移除单元格边框 */
  padding: 4px 0 !important;
  height: 32px !important;
  font-size: 12px !important;
}

.search-results :deep(.el-table .cell) {
  padding-left: 5px !important;
  padding-right: 5px !important;
  line-height: 1.2 !important;
}

.search-results :deep(.el-table--border), 
.search-results :deep(.el-table--group) {
  border: none !important; /* 移除表格边框 */
}

.search-results :deep(.el-table--border::after), 
.search-results :deep(.el-table--group::after) {
  display: none !important; /* 移除表格边框阴影 */
}

.search-results :deep(.el-table__inner-wrapper) {
  border: none !important; /* 移除内部包装器边框 */
}

.search-results :deep(.el-table__border-left-patch) {
  display: none !important; /* 移除左侧边框补丁 */
}

/* 移除表格内所有可能的边框 */
.search-results :deep(.el-table td.el-table__cell), 
.search-results :deep(.el-table th.el-table__cell.is-leaf) {
  border: none !important;
}

/* 确保表格行之间没有边框 */
.search-results :deep(.el-table__row) {
  border: none !important;
}

/* 移除表格固定列的边框 */
.search-results :deep(.el-table__fixed-right),
.search-results :deep(.el-table__fixed) {
  border: none !important;
  box-shadow: none !important;
}

/* 移除表格内部所有分隔线 */
.search-results :deep(.el-table__body) tr:not(:last-child) td {
  border-bottom: none !important;
}

/* 移除表格内所有边框线 */
.search-results :deep(.el-table::before),
.search-results :deep(.el-table::after) {
  display: none !important;
}

/* 移除表格内部的横向分隔线 */
.search-results :deep(.el-table__body) tr.el-table__row td {
  border-bottom: none !important;
}

/* 移除表格头部和内容之间的分隔线 */
.search-results :deep(.el-table__header-wrapper) {
  border-bottom: none !important;
}

/* 移除表格所有边框和分隔线 */
.search-results :deep(.el-table--border)::after,
.search-results :deep(.el-table--border)::before,
.search-results :deep(.el-table__cell)::after,
.search-results :deep(.el-table__cell)::before {
  display: none !important;
}

/* 处理表格内部的所有可能的边框 */
.search-results :deep(.el-table),
.search-results :deep(.el-table tr),
.search-results :deep(.el-table th),
.search-results :deep(.el-table td),
.search-results :deep(.el-table--border),
.search-results :deep(.el-table--group) {
  border-style: none !important;
  border-width: 0 !important;
}

/* 确保 No Data 行没有边框 */
.search-results :deep(.el-table__empty-block) {
  border: none !important;
}

/* 处理表格内部可能的分隔线 */
.search-results :deep(.el-table__footer-wrapper),
.search-results :deep(.el-table__append-wrapper) {
  border-top: none !important;
}

/* 完全覆盖表格样式 - 强制移除所有边框 */
.search-results :deep(.el-table) {
  --el-table-border-color: transparent !important;
  --el-table-border: 0px !important;
  --el-table-header-border-color: transparent !important;
  --el-table-row-hover-bg-color: #333 !important;
}

/* 使用伪元素覆盖可能出现的边框 */
.search-results::after {
  content: "";
  position: absolute;
  top: 32px; /* 表头高度 */
  left: 0;
  right: 0;
  height: 1px;
  background-color: #1a1a1a; /* 与背景色相同 */
  z-index: 10;
}

/* 创建一个完全没有边框的自定义表格样式 */
.search-results :deep(.el-table) {
  border-collapse: collapse !important;
}

.search-results :deep(.el-table::before),
.search-results :deep(.el-table__inner-wrapper::before),
.search-results :deep(.el-table__inner-wrapper::after),
.search-results :deep(.el-table::after) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

/* 使用更高优先级的选择器覆盖边框 */
.search-results :deep(.el-table),
.search-results :deep(.el-table__inner-wrapper),
.search-results :deep(.el-table__header-wrapper),
.search-results :deep(.el-table__body-wrapper),
.search-results :deep(.el-table__footer-wrapper),
.search-results :deep(.el-table__header),
.search-results :deep(.el-table__body),
.search-results :deep(.el-table__footer) {
  border: none !important;
  background-clip: padding-box !important;
}

/* 完全覆盖表头和表格之间的边框 */
.search-results :deep(.el-table__header-wrapper::after) {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background-color: #1a1a1a;
  z-index: 100;
}

/* 最终解决方案：使用最强大的选择器覆盖所有边框 */
.search-results :deep(*) {
  border-color: transparent !important;
}

/* 特别针对表头和表格内容之间的边框 */
.search-results :deep(.el-table__header-wrapper) {
  position: relative;
}

.search-results :deep(.el-table__header-wrapper)::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px; /* 稍微厚一点以确保覆盖 */
  background-color: #1a1a1a;
  z-index: 9999;
}

.search-results :deep(.el-button--small) {
  padding: 4px 8px;
  min-height: 24px;
  font-size: 12px;
}

.map-loading-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #2c2c2c; /* 完全不透明 */
  z-index: 10;
}

.map-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-icon {
  width: 50px;
  height: 50px;
  margin-bottom: 15px;
}

.loading-text {
  color: #ffffff;
  font-size: 16px;
}

.map-error-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #2c2c2c; /* 完全不透明 */
  z-index: 10;
}

.map-error-card {
  background: #1a1a1a !important; /* 完全不透明 */
  border: 1px solid #2c2c2c !important; /* 不透明边框 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.map-error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 10px;
}

.error-message {
  color: #ffffff;
  font-size: 14px;
  margin-bottom: 20px;
}

.data-management-dialog {
  position: fixed;
  top: 10px;
  left: 250px;
  cursor: move;
}

/* 自定义El-radio-group样式 */
.control-panel-item :deep(.el-radio-group) {
  display: flex;
  justify-content: flex-end;
}

.control-panel-item :deep(.el-radio-button) {
  margin-right: 0;
}

.control-panel-item :deep(.el-radio-button__inner) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 5px 10px;
  font-size: 12px;
}

.control-panel-item :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #409EFF;
  border-color: #409EFF;
  box-shadow: -1px 0 0 0 #409EFF;
}

/* 自定义El-switch样式 */
.control-panel-item :deep(.el-switch__core) {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 修复地图上的信息窗口样式 */
:deep(.amap-info-content) {
  color: #333;
}

:deep(.amap-info-close) {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

/* 调整滚动条 */
:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}



.search-tabs {
  margin-bottom: 10px;
  padding: 0;
}

.search-type-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 28px);
  grid-column-gap: 6px;
  grid-row-gap: 6px;
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.search-type-buttons :deep(.el-button) {
  padding: 6px 8px;
  font-size: 12px;
  text-align: center;
  background-color: #2c2c2c;
  border-color: #444;
  color: #e6e6e6;
  height: 28px;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  width: 100%;
}

.search-type-buttons :deep(.el-button.is-plain:focus),
.search-type-buttons :deep(.el-button.is-plain:hover) {
  background-color: #3c3c3c;
  color: #fff;
}

.search-type-buttons :deep(.el-button--primary) {
  background-color: #409EFF;
  border-color: #409EFF;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.form-item {
  margin-bottom: 8px;
}

.form-item label {
  display: block;
  margin-bottom: 4px;
  color: #b8b8b8;
  font-size: 12px;
  position: relative;
  padding-left: 8px;
}

.form-item label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 10px;
  background: #409EFF;
  border-radius: 1px;
  opacity: 0.7;
}

.input-group {
  display: flex;
  align-items: center;
  background-color: #2c2c2c;
  border-radius: 4px;
  border: 1px solid #444;
  overflow: hidden;
}

.input-group .el-button {
  background-color: transparent;
  border: none;
  color: #e6e6e6;
  height: 28px;
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
}

.input-group .el-button:hover {
  background-color: #3c3c3c;
  color: #fff;
}

.input-group .el-button:active {
  background-color: #444;
}

.input-group :deep(.el-input-number) {
  flex: 1;
  margin: 0;
  border: none;
}

.input-group :deep(.el-input-number .el-input__wrapper) {
  box-shadow: none !important;
  padding: 0 8px;
}

:deep(.el-input__wrapper),
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background-color: transparent !important;
  border: none !important;
  color: #e6e6e6 !important;
  box-shadow: none !important;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  border-radius: 0 !important;
  background-color: #3c3c3c !important;
}

:deep(.el-input__inner) {
  color: #e6e6e6 !important;
  height: 28px;
  font-size: 12px;
  text-align: center;
}

:deep(.el-date-editor.el-input) {
  width: 100%;
}

:deep(.el-date-editor .el-input__wrapper) {
  background-color: #2c2c2c !important;
  border: 1px solid #444 !important;
  border-radius: 4px;
  padding: 0 8px;
  height: 28px;
}

:deep(.el-date-editor .el-input__inner) {
  height: 28px;
  font-size: 12px;
}

:deep(.el-date-editor .el-input__icon) {
  line-height: 28px;
  height: 28px;
}

.search-btn-full {
  width: 100%;
  margin-top: 8px;
  background-color: #409EFF;
  border-color: #409EFF;
  height: 32px;
  font-size: 13px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.search-btn-full:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.search-date-input {
  width: 100%;
}

.search-date-input :deep(.el-input__wrapper) {
  background-color: #333333 !important;
  box-shadow: none !important;
  border: 1px solid #444;
  border-radius: 4px;
}

.search-date-input :deep(.el-input__inner) {
  color: #e6e6e6 !important;
  height: 32px;
  font-size: 14px;
  text-align: center;
}

.search-date-input :deep(.el-input__prefix),
.search-date-input :deep(.el-input__suffix) {
  color: #909399;
}

.search-results-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #333;
}

.search-results-title .title {
  font-size: 12px;
  font-weight: 500;
  color: #b8b8b8;
  position: relative;
  padding-left: 10px;
}

.search-results-title .title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 12px;
  background: #409EFF;
  border-radius: 2px;
}

.search-results-title :deep(.el-button) {
  padding: 4px 8px;
  font-size: 12px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.search-results-title :deep(.el-button:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.simple-input {
  width: 100%;
  background-color: #333333;
  border-radius: 4px;
  border: none;
  overflow: hidden;
}

.simple-input :deep(.el-input__wrapper) {
  background-color: #333333 !important;
  box-shadow: none !important;
  padding: 0 8px;
  border: none;
}

.simple-input :deep(.el-input__inner) {
  color: #e6e6e6 !important;
  height: 32px;
  font-size: 14px;
  text-align: center;
  background-color: #333333;
}

.simple-input :deep(.el-input__suffix) {
  display: none;
}

.search-date-input :deep(.el-input__wrapper) {
  background-color: #333333 !important;
  box-shadow: none !important;
  border: none;
  border-radius: 4px;
}
</style> 