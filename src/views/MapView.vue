<template>
  <div class="amap-container">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">{{ loadingText }}</div>
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
      <el-button type="primary" size="small" @click="retryLoading" style="margin-top: 10px;">
        重试
      </el-button>
    </div>
    <div ref="mapContainer" class="map-container"></div>
    
    <!-- 地图控制面板 -->
    <div class="map-controls">
      <el-card class="control-card">
        <div class="control-section">
          <h4>视图模式</h4>
          <el-switch
            v-model="is3DMode"
            active-text="3D"
            inactive-text="2D"
            @change="toggle3DMode"
          />
        </div>
        
        <div class="control-section">
          <h4>地图样式</h4>
          <el-radio-group v-model="currentStyle" @change="changeMapStyle">
            <el-radio-button label="normal">标准</el-radio-button>
            <el-radio-button label="satellite">卫星</el-radio-button>
            <el-radio-button label="dark">深色</el-radio-button>
          </el-radio-group>
        </div>

        <div class="control-section">
          <h4>位置搜索</h4>
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="请输入地址"
              :prefix-icon="Search"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">
                  搜索
                </el-button>
              </template>
            </el-input>
          </div>
          <!-- 搜索结果列表 -->
          <div v-if="searchResults.length > 0" class="search-results">
            <el-scrollbar height="150px">
              <el-list>
                <el-list-item
                  v-for="(item, index) in searchResults"
                  :key="index"
                  @click="handleSelectLocation(item)"
                  class="search-result-item"
                >
                  <div class="location-info">
                    <div class="location-name">{{ item.name }}</div>
                    <div class="location-address">{{ item.address }}</div>
                  </div>
                </el-list-item>
              </el-list>
            </el-scrollbar>
          </div>
          <!-- 添加空白区域 -->
          <div class="empty-area"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ElButton, ElCard, ElSwitch, ElRadioGroup, ElRadioButton, ElInput, ElScrollbar } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import AMapLoader from '@amap/amap-jsapi-loader'

export default {
  name: 'MapView',
  components: {
    ElButton,
    ElCard,
    ElSwitch,
    ElRadioGroup,
    ElRadioButton,
    ElInput,
    ElScrollbar
  },
  data() {
    return {
      map: null,
      apiLoaded: false,
      loading: true,
      error: null,
      loadingText: '正在加载地图...',
      retryCount: 0,
      maxRetries: 3,
      amapKey: 'f7aa41ab3112b5fc450b547c00771fdc',
      is3DMode: true,
      currentStyle: 'dark',
      satellite: null,
      // 搜索相关数据
      searchKeyword: '',
      searchResults: [],
      placeSearch: null,
      currentMarker: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      // 确保DOM已经渲染
      if (this.$refs.mapContainer) {
        this.initAMap();
      } else {
        console.error('地图容器元素未找到');
        this.handleError(new Error('地图容器元素未找到'));
      }
    });
  },
  beforeUnmount() {
    // 清理地图实例
    if (this.map) {
      this.map.destroy();
    }
    
    // 清理事件监听
    if (this.cleanupHandlers) {
      this.cleanupHandlers();
    }
  },
  methods: {
    async initAMap() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('开始初始化高德地图');
        // 确保安全密钥已经设置
        if (!window._AMapSecurityConfig) {
          console.warn('未检测到安全密钥配置，正在设置...');
          window._AMapSecurityConfig = {
            securityJsCode: this.amapKey
          };
        }

        const AMap = await this.loadAMapAPI();
        console.log('高德地图API加载成功:', AMap);
        if (!AMap) {
          throw new Error('高德地图API加载失败：AMap 对象为空');
        }
        await this.initMap();
      } catch (error) {
        console.error('初始化高德地图失败:', error);
        this.handleError(error);
      }
    },
    loadAMapAPI() {
      console.log('开始加载高德地图API，使用Key:', this.amapKey);
      return new Promise((resolve, reject) => {
        // 检查是否已经加载过
        if (window.AMap) {
          console.log('使用已加载的AMap实例');
          resolve(window.AMap);
          return;
        }

        AMapLoader.load({
          key: this.amapKey,
          version: '2.0',
          plugins: [
            'AMap.Scale',
            'AMap.ToolBar'
          ],
          // 添加 AMap.js 加载超时时间
          timeout: 10000,
          // 开启缓存
          useCache: true,
          // 开启 HTTPS
          protocol: 'https'
        }).then(AMap => {
          console.log('AMap加载成功');
          resolve(AMap);
        }).catch(error => {
          console.error('加载高德地图API时出错:', error);
          reject(new Error('加载高德地图API失败: ' + (error.message || '未知错误')));
        });
      });
    },
    async initMap() {
      try {
        console.log('开始创建地图实例');
        if (!window.AMap) {
          throw new Error('AMap 全局对象不存在，API可能未正确加载');
        }
        
        const mapOptions = {
          zoom: 7.5,
          center: [102.712251, 25.040609],
          mapStyle: 'amap://styles/dark',
          viewMode: '3D',
          skyColor: '#1a1a1a',
          features: ['bg', 'road', 'building', 'point'],
          showBuildingBlock: false,
          rotateEnable: true,
          pitchEnable: true,
          dragEnable: true,
          keyboardEnable: true,
          doubleClickZoom: true,
          zoomEnable: true,
          preloadMode: true,
          expandZoomRange: true,
          zooms: [6, 18],
          defaultCursor: 'grab',
          touchZoom: true,
          touchZoomCenter: 1,
          jogEnable: true,
          backgroundColor: '#1a1a1a'
        };

        this.map = new AMap.Map(this.$refs.mapContainer, mapOptions);

        // 等待地图加载完成
        await new Promise((resolve, reject) => {
          this.map.on('complete', () => {
            console.log('地图加载完成');
            this.loading = false;
            this.setupMapInteraction();
            resolve();
          });

          this.map.on('error', (error) => {
            console.error('地图加载出错:', error);
            reject(new Error('地图加载失败: ' + (error.message || '未知错误')));
          });

          // 设置超时
          setTimeout(() => {
            reject(new Error('地图加载超时'));
          }, 10000);
        });

        // 加载必要的插件
        await new Promise((resolve) => {
          AMap.plugin(['AMap.DistrictSearch', 'AMap.DistrictLayer', 'AMap.Text'], () => {
            resolve();
          });
        });

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
              const province = result.districtList[0];
              
              // 创建省界遮罩
              const bounds = province.boundaries;
              const pathArray = [
                [
                  new AMap.LngLat(-360, 90),
                  new AMap.LngLat(-360, -90),
                  new AMap.LngLat(360, -90),
                  new AMap.LngLat(360, 90)
                ]
              ];
              
              if (bounds) {
                bounds.forEach(boundary => {
                  pathArray.push(boundary);
                });
              }

              // 添加省界遮罩
              const polygon = new AMap.Polygon({
                path: pathArray,
                strokeWeight: 1,
                strokeColor: '#2c2c2c',
                fillColor: '#1a1a1a',
                fillOpacity: 0.8,
                strokeStyle: 'solid'
              });
              this.map.add(polygon);

              // 设置地图视野
              this.map.setFitView([polygon], {
                padding: [50, 50, 50, 50]
              });

              // 限制地图范围
              const provinceBounds = new AMap.Bounds(
                [97.31833, 21.14163],
                [106.19016, 29.22041]
              );
              this.map.setLimitBounds(provinceBounds);

              // 添加地区标注
              if (province.districtList) {
                province.districtList.forEach(district => {
                  if (district.center) {
                    const text = new AMap.Text({
                      text: district.name,
                      position: district.center,
                      anchor: 'center',
                      style: {
                        'padding': '5px 10px',
                        'backgroundColor': '#00000000',
                        'borderColor': '#00000000',
                        'color': '#e6e6e6',
                        'fontSize': '12px',
                        'fontWeight': 'bold',
                        'textShadow': '1px 1px 2px #000000cc'
                      },
                      zIndex: 10
                    });
                    this.map.add(text);
                  }
                });
              }

              // 添加省名标注
              if (province.center) {
                const provinceText = new AMap.Text({
                  text: '云南省',
                  position: province.center,
                  anchor: 'center',
                  style: {
                    'padding': '5px 10px',
                    'backgroundColor': '#00000000',
                    'borderColor': '#00000000',
                    'color': '#ffffff',
                    'fontSize': '16px',
                    'fontWeight': 'bold',
                    'textShadow': '1px 1px 3px #000000e6'
                  },
                  zIndex: 11
                });
                this.map.add(provinceText);
              }

              // 添加行政区划层
              const districtLayer = new AMap.DistrictLayer.Province({
                zIndex: 5,
                adcode: ['530000'],
                depth: 2,
                styles: {
                  'fill': function() {
                    return {
                      color: '#2c2c2c1a',
                      borderColor: '#3c3c3c',
                      borderWidth: 1,
                      borderType: 'solid'
                    }
                  },
                  'province-stroke': function() {
                    return {
                      color: '#3c3c3c',
                      width: 1.5
                    }
                  },
                  'city-stroke': function() {
                    return {
                      color: '#2c2c2c',
                      width: 1
                    }
                  },
                  'county-stroke': function() {
                    return {
                      color: '#1a1a1a',
                      width: 0.5
                    }
                  }
                }
              });
              districtLayer.setMap(this.map);
            }
            resolve();
          });
        });

        // 初始化搜索服务
        await new Promise((resolve) => {
          AMap.plugin(['AMap.PlaceSearch'], () => {
            this.placeSearch = new AMap.PlaceSearch({
              pageSize: 10,
              pageIndex: 1,
              extensions: 'all',
              city: '云南省'
            });
            resolve();
          });
        });

      } catch (error) {
        console.error('初始化地图失败:', error);
        this.handleError(error);
      }
    },
    // 设置地图交互
    setupMapInteraction() {
      if (!this.map) return;

      try {
        // 禁止地图默认的右键菜单
        this.map.on('rightclick', (e) => {
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
        const mapContainer = this.$refs.mapContainer;
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
          if (isRightMouseDown && this.is3DMode && this.map) {
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            try {
              // 调整旋转角度
              const currentRotation = this.map.getRotation() || 0;
              this.map.setRotation(currentRotation + deltaX * 0.5);

              // 调整俯仰角度
              const currentPitch = this.map.getPitch() || 0;
              const newPitch = currentPitch - deltaY * 0.5;
              // 限制俯仰角度在0-80度之间
              this.map.setPitch(Math.min(Math.max(newPitch, 0), 80));

              // 更新界面上的滑块值
              this.rotation = this.map.getRotation() || 0;
              this.pitch = this.map.getPitch() || 0;
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
        this.cleanupHandlers = () => {
          window.removeEventListener('mouseup', handleMouseUp);
        };

        console.log('地图交互设置完成');
      } catch (error) {
        console.error('设置地图交互失败:', error);
      }
    },
    // 切换2D/3D模式
    toggle3DMode(value) {
      if (!this.map) return;
      
      try {
        console.log('尝试切换视图模式:', value ? '3D' : '2D');
        
        const options = {
          viewMode: value ? '3D' : '2D',
          pitch: value ? this.pitch : 0,
          rotation: value ? this.rotation : 0
        };
        
        // 先设置视图模式
        this.map.setStatus({
          viewMode: options.viewMode
        });
        
        // 然后设置俯仰角和旋转角
        setTimeout(() => {
          if (value) {
            this.map.setPitch(options.pitch);
            this.map.setRotation(options.rotation);
          } else {
            this.map.setPitch(0);
            this.map.setRotation(0);
          }
        }, 100);

        console.log('视图模式切换成功:', options);
      } catch (error) {
        console.error('切换视图模式失败:', error);
        // 恢复开关状态
        this.is3DMode = !value;
      }
    },
    // 切换地图样式
    changeMapStyle(style) {
      if (!this.map) return;
      
      try {
        // 移除卫星图层
        if (this.satellite) {
          this.map.remove(this.satellite);
        }

        switch (style) {
          case 'normal':
            this.map.setMapStyle('amap://styles/normal');
            break;
          case 'satellite':
            this.map.setMapStyle('amap://styles/normal');
            this.map.add(this.satellite);
            break;
          case 'dark':
            this.map.setMapStyle('amap://styles/dark');
            break;
        }
        console.log('地图样式切换成功:', style);
      } catch (error) {
        console.error('切换地图样式失败:', error);
        this.currentStyle = this.map.getMapStyle() || 'normal';
      }
    },
    handleError(error) {
      this.loading = false;
      const errorMsg = error.message || '未知错误';
      console.error('地图错误详情:', {
        message: errorMsg,
        stack: error.stack,
        error: error
      });
      
      if (this.retryCount < this.maxRetries) {
        this.error = errorMsg + '，正在重试 (' + (this.retryCount + 1) + '/' + this.maxRetries + ')...';
        this.retryCount++;
        console.log('尝试重新加载地图，重试次数:', this.retryCount);
        setTimeout(() => {
          this.initAMap();
        }, 2000);
      } else {
        this.error = errorMsg + '，请点击重试按钮重新加载';
        console.error('重试次数已达上限，停止自动重试');
      }
    },
    retryLoading() {
      this.retryCount = 0;
      this.initAMap();
    },
    // 添加搜索相关方法
    async handleSearch() {
      if (!this.searchKeyword.trim()) {
        this.$message.warning('请输入搜索关键词');
        return;
      }

      if (!this.placeSearch) {
        this.$message.error('搜索服务未初始化');
        return;
      }

      try {
        this.searchResults = [];
        await new Promise((resolve, reject) => {
          this.placeSearch.search(this.searchKeyword, (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
              this.searchResults = result.poiList.pois;
              resolve();
            } else {
              this.$message.error('搜索失败：' + result.info);
              reject(new Error(result.info));
            }
          });
        });
      } catch (error) {
        console.error('搜索出错：', error);
        this.$message.error('搜索服务出错');
      }
    },

    handleSelectLocation(item) {
      // 清除之前的标记
      if (this.currentMarker) {
        this.map.remove(this.currentMarker);
      }

      // 创建新的标记
      this.currentMarker = new AMap.Marker({
        position: [item.location.lng, item.location.lat],
        title: item.name,
        animation: 'AMAP_ANIMATION_DROP'
      });

      // 将标记添加到地图
      this.map.add(this.currentMarker);
      
      // 平滑移动到选中位置
      this.map.setZoomAndCenter(15, [item.location.lng, item.location.lat], false, 1000);

      // 清空搜索结果
      this.searchResults = [];
    }
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

.map-controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
}

.control-card {
  background: rgba(26, 26, 26, 0.9) !important;
  border: none !important;
  backdrop-filter: blur(10px);
}

.control-section {
  margin-bottom: 20px;
}

.control-section:last-child {
  margin-bottom: 0;
}

.control-section h4 {
  color: #ffffff;
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: normal;
}

:deep(.el-radio-button__inner) {
  background: #2c2c2c;
  border-color: #1a1a1a;
  color: #ffffff;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #409EFF;
  border-color: #409EFF;
  color: #ffffff;
}

:deep(.el-switch__label) {
  color: #ffffff;
}

.loading-overlay {
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

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #409EFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.loading-text {
  color: #ffffff;
  font-size: 16px;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 73, 73, 0.9);
  color: white;
  padding: 20px;
  border-radius: 4px;
  max-width: 80%;
  text-align: center;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.search-box {
  margin-bottom: 10px;
  background: white;
  border-radius: 4px;
  padding: 10px;
}

.empty-area {
  height: 480px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  margin-top: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-results {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  padding: 10px;
}

.search-result-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-result-item:hover {
  background-color: #f5f7fa;
}

.location-info {
  display: flex;
  flex-direction: column;
}

.location-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.location-address {
  font-size: 12px;
  color: #909399;
}
</style> 