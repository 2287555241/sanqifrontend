import axios from 'axios';

export const useExportService = () => {
  /**
   * 导出矢量数据
   * @param {Object} params - 导出参数
   * @param {Array} params.ids - 需要导出的数据ID数组
   * @param {String} params.format - 导出格式，如 'shp', 'geojson', 'kml'
   * @param {String} params.srs - 坐标参考系统，如 'EPSG:4326'
   * @param {String} params.packageType - 打包方式，'single' 或 'zip'
   * @returns {Promise} 包含下载链接的Promise
   */
  const exportVectorData = async (params) => {
    try {
      const { ids, directory } = params;

      // 检查参数
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new Error('导出数据ID不能为空');
      }

      let url;
      // 使用与HTML示例一致的API路径
      if (ids.length > 0) {
        // 选择性导出
        url = `http://localhost:8888/api/vector-data/export/selected?ids=${ids.join(',')}`;
        if (directory) {
          url += `&directory=${encodeURIComponent(directory)}`;
        }
      } else {
        // 导出全部
        url = 'http://localhost:8888/api/vector-data/export';
        if (directory) {
          url += `?directory=${encodeURIComponent(directory)}`;
        }
      }

      // 发送导出请求，从HTML示例看是直接下载文件
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`导出失败: ${response.status} ${response.statusText}`);
      }

      // 返回blob数据用于下载
      const blob = await response.blob();
      return {
        success: true,
        blob,
        type: 'blob',
        downloadUrl: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error('导出矢量数据失败:', error);
      throw error;
    }
  };

  /**
   * 导出栅格数据
   * @param {Object} params - 导出参数
   * @param {Array} params.ids - 需要导出的数据ID数组
   * @param {String} params.format - 导出格式，如 'tif', 'jpg', 'png'
   * @param {String} params.resolution - 分辨率，如 'original', 'high', 'medium', 'low'
   * @param {String} params.packageType - 打包方式，'single' 或 'zip'
   * @returns {Promise} 包含下载链接的Promise
   */
  const exportRasterData = async (params) => {
    try {
      // 检查参数
      if (!params.ids || !Array.isArray(params.ids) || params.ids.length === 0) {
        throw new Error('导出数据ID不能为空');
      }

      // 栅格数据导出接口，目前在HTML中没有看到，但保持一致的模式
      const url = `http://localhost:8888/api/raster/export?ids=${params.ids.join(',')}`;

      // 发送导出请求
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`导出失败: ${response.status} ${response.statusText}`);
      }

      // 返回blob数据用于下载
      const blob = await response.blob();
      return {
        success: true,
        blob,
        type: 'blob',
        downloadUrl: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error('导出栅格数据失败:', error);
      throw error;
    }
  };

  /**
   * 直接下载文件
   * @param {String} url - 文件下载URL
   * @param {String} filename - 保存的文件名
   */
  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    exportVectorData,
    exportRasterData,
    downloadFile
  };
}; 