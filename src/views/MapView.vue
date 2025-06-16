<template>
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
          <div class="control-panel-item">
            <span>2D/3D切换</span>
            <el-switch v-model="is3DMode" @change="toggle3DMode" />
          </div>
          <div class="control-panel-item">
            <span>地图样式</span>
            <el-radio-group v-model="currentStyle" size="small" @change="changeMapStyle">
              <el-radio-button label="normal">标准</el-radio-button>
              <el-radio-button label="satellite">卫星</el-radio-button>
              <el-radio-button label="dark">深色</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <div class="control-panel-section">
          <div class="control-panel-title">位置搜索</div>
          <div class="search-box">
            <el-input 
              v-model="searchKeyword" 
              placeholder="搜索位置" 
              @keyup.enter="handleSearch"
              class="search-input"
            >
              <template #suffix>
                <el-button class="search-btn" @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
          
          <div v-if="searchResults.length > 0" class="search-results">
            <el-scrollbar height="200px">
              <div 
                v-for="(item, index) in searchResults" 
                :key="index" 
                class="search-result-item"
                @click="handleSelectLocation(item)"
              >
                <div class="result-name">{{ item.name }}</div>
                <div class="result-address">{{ item.address }}</div>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, markRaw, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import { 
  Location, 
  Search, 
  Refresh, 
  FullScreen, 
  Close, 
  ArrowRight, 
  ArrowLeft,
  View,
  Hide
} from '@element-plus/icons-vue'
import axios from 'axios'
import { useProjectStore } from '../stores/project'
import { useUIStore } from '../stores/ui'
// 不使用 AMap Loader，改为直接加载
// import AMapLoader from '@amap/amap-jsapi-loader'

// 获取路由参数
const route = useRoute()
const isOnlyMapMode = computed(() => route.query.onlyMap === 'true')
const shouldFocusYunnan = computed(() => route.query.yunnanView === 'true')

// UI状态管理
const uiStore = useUIStore()

// 监听地图模式变化
watch([isOnlyMapMode, shouldFocusYunnan], ([newMapMode, newFocusYunnan]) => {
  if (map.value) {
    if (newMapMode) {
      // 切换到纯地图模式，清除三七区域显示
      if (sanqiPolygons.value.length > 0) {
        map.value.remove(sanqiPolygons.value);
        sanqiPolygons.value = [];
      }
    } else {
      // 切换到完整模式，加载三七区域
      loadSanqiRegions();
      initializeMapFeatures();
    }
    
    // 如果需要聚焦到云南省，则调用focusOnYunnan方法
    if (newFocusYunnan) {
      focusOnYunnan();
    }
  }
});

const icons = {
  location: markRaw(Location),
  search: markRaw(Search),
  refresh: markRaw(Refresh),
  fullScreen: markRaw(FullScreen),
  close: markRaw(Close),
  arrowRight: markRaw(ArrowRight),
  arrowLeft: markRaw(ArrowLeft),
  view: markRaw(View),
  hide: markRaw(Hide)
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
const is3DMode = ref(true)
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

const projectStore = useProjectStore()
const currentProject = computed(() => projectStore.getCurrentProject())

onMounted(() => {
  console.log('MapView组件已挂载');
  initializeMap();
})

onBeforeUnmount(() => {
  // 清理地图实例
  if (map.value) {
    map.value.destroy();
  }
  
  // 清理事件监听
  if (cleanupHandlers) {
    cleanupHandlers();
  }
})

const initializeMap = async () => {
  try {
    loading.value = true;
    await initMap();
    
    // 只在非纯地图模式下加载额外数据
    if (!isOnlyMapMode.value) {
      // 初始化完成后加载其他数据
      await loadSanqiRegions();
      await initializeMapFeatures();
    } else {
      // 纯地图模式下只加载基础地图
      loading.value = false;
    }
  } catch (error) {
    console.error('地图初始化失败:', error);
    handleError(error);
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
    console.log('开始加载三七种植区域数据');
    loadingText.value = '正在加载三七种植区域数据...';
    
    // 清除旧的多边形
    if (sanqiPolygons.value.length > 0) {
      map.value.remove(sanqiPolygons.value);
      sanqiPolygons.value = [];
    }
    
    // 从后端API获取数据
    const response = await axios.get('/api/SanqiRegion');
    sanqiRegions.value = response.data;
    
    console.log('成功获取三七区域数据:', sanqiRegions.value);
    
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
  if (!map.value || !sanqiRegions.value || !sanqiRegions.value.features) {
    console.error('无法渲染三七区域: 地图或数据不存在');
    return;
  }
  
  console.log(`开始渲染 ${sanqiRegions.value.features.length} 个三七区域`);
  
  try {
    // 为每个区域创建多边形
    sanqiRegions.value.features.forEach(feature => {
      if (!feature.geometry || !feature.geometry.coordinates) {
        console.warn('区域缺少坐标数据:', feature);
        return;
      }
      
      const geometry = feature.geometry;
      const properties = feature.properties || {};
      
      try {
        let paths = [];
        
        // 处理不同类型的几何形状
        if (geometry.type === 'Polygon') {
          // 多边形，只取第一个外环
          paths = geometry.coordinates[0].map(coord => {
            return new AMap.LngLat(coord[0], coord[1]);
          });
        } else if (geometry.type === 'MultiPolygon') {
          // 多重多边形，每个子多边形取第一个外环
          geometry.coordinates.forEach(polygon => {
            const polygonPath = polygon[0].map(coord => {
              return new AMap.LngLat(coord[0], coord[1]);
            });
            paths.push(polygonPath);
          });
        } else {
          console.warn('不支持的几何类型:', geometry.type);
          return;
        }
        
        // 创建多边形对象
        const polygon = new AMap.Polygon({
          path: paths,
          strokeColor: '#4CAF50',
          strokeWeight: 2,
          strokeOpacity: 0.8,
          fillColor: '#81C784',
          fillOpacity: 0.4,
          cursor: 'pointer',
          extData: {
            id: properties.id,
            name: properties.name,
            area: properties.area,
            description: properties.description
          }
        });
        
        // 添加点击事件
        polygon.on('click', () => {
          console.log('区域信息:', properties);
          // 可以在这里显示详细信息窗口
          const infoWindow = new AMap.InfoWindow({
            content: `<div style="padding:10px;">
                        <h3>${properties.name || '未命名区域'}</h3>
                        <p>ID: ${properties.gid || '无'}</p>
                      </div>`,
            offset: new AMap.Pixel(0, -30)
          });
          
          infoWindow.open(map.value, polygon.getBounds().getCenter());
        });
        
        // 将多边形添加到地图
        map.value.add(polygon);
        sanqiPolygons.value.push(polygon);
        
      } catch (e) {
        console.error('创建多边形失败:', e, feature);
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

// 设置地图交互
const setupMapInteraction = () => {
  if (!map.value) return;

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
    const mapContainer = mapContainer.value;
    if (!mapContainer) {
      console.error('地图容器元素未找到');
      return;
    }

    // 禁用默认的右键菜单
    mapContainer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    mapContainer.addEventListener('mousedown', (e) => {
      if (e.button === 1) { // 中键
        isRightMouseDown = true;
        lastX = e.clientX;
        lastY = e.clientY;
        e.preventDefault();
      }
    });

    mapContainer.addEventListener('mousemove', (e) => {
      if (isRightMouseDown && is3DMode.value && map.value) {
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
    cleanupHandlers = () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };

    console.log('地图交互设置完成');
  } catch (error) {
    console.error('设置地图交互失败:', error);
  }
}

// 切换2D/3D模式
const toggle3DMode = async (value) => {
  if (!map.value) return;
  
  try {
    console.log('切换视图模式:', value ? '3D' : '2D');
    
    // 保存当前中心点和缩放级别
    const center = map.value.getCenter();
    const zoom = map.value.getZoom();
    
    // 设置视图模式
    map.value.setStatus({
      viewMode: value ? '3D' : '2D',
      jogEnable: value,
      pitchEnable: value,
      rotateEnable: value
    });
    
    if (!value) {
      // 切换到2D模式时，重置视角
      map.value.setPitch(0);
      map.value.setRotation(0);
      map.value.setFeatures(['bg', 'road', 'point', 'label']);
      // 移除3D建筑物图层
      map.value.setLayers([new AMap.TileLayer()]);
    } else {
      // 切换到3D模式
      map.value.setFeatures(['bg', 'road', 'point', 'building', 'label']);
      map.value.setLayers([
        new AMap.TileLayer(),
        new AMap.Buildings({
          zooms: [16, 20],
          zIndex: 10
        })
      ]);
    }
    
    // 恢复中心点和缩放级别
    map.value.setCenter(center);
    map.value.setZoom(zoom);
    
    // 更新界面上的控制值
    pitch.value = map.value.getPitch() || 0;
    rotation.value = map.value.getRotation() || 0;
    
    console.log('视图模式切换成功');
  } catch (error) {
    console.error('切换视图模式失败:', error);
    ElMessage.error('切换视图模式失败，请重试');
    // 恢复开关状态
    is3DMode.value = !value;
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
</script>

<style scoped>
.amap-container {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 30px);
  background: #2c2c2c;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 30px);
  position: relative;
  z-index: 1;
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
  top: 0;
  left: 0;
  width: 300px;
  height: 100%;
  z-index: 100;
  pointer-events: none; /* 允许地图点击穿透 */
}

.control-panel {
  width: 270px;
  height: calc(100% - 40px);
  margin: 20px;
  background: rgba(40, 44, 52, 0.85);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  color: #fff;
  pointer-events: auto; /* 恢复指针事件 */
  overflow-y: auto;
  padding: 15px;
}

.control-panel-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.control-panel-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.control-panel-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #fff;
}

.control-panel-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.view-controls-container {
  margin-top: 10px;
}

.view-controls-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
}

.control-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.control-btn:hover {
  background: rgba(64, 158, 255, 0.2);
}

.control-btn:active {
  background: rgba(64, 158, 255, 0.3);
}

.reset-view {
  display: flex;
  justify-content: center;
}

.reset-btn {
  width: auto;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.search-box {
  margin-bottom: 10px;
}

.search-input {
  width: 100%;
}

.search-btn {
  border: none;
  background: transparent;
  color: #409EFF;
}

.search-results {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-top: 10px;
}

.search-result-item {
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.3s;
}

.search-result-item:hover {
  background: rgba(64, 158, 255, 0.1);
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-name {
  font-weight: 500;
  margin-bottom: 3px;
}

.result-address {
  font-size: 12px;
  color: #ccc;
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
  background-color: rgba(44, 44, 44, 0.9);
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
  background-color: rgba(44, 44, 44, 0.9);
  z-index: 10;
}

.map-error-card {
  background: rgba(26, 26, 26, 0.9) !important;
  border: none !important;
  backdrop-filter: blur(10px);
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
</style> 