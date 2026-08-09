/** 环境配置项 */
export interface EnvConfig {
  name: string
  gateway: string
  sso_app: string
  application: string
  suffix?: string
  app_path?: string
  ws_protocol?: string
  ws_ip?: string
  ws_port?: string
  ws_gateway?: string
  homePageNo?: string
  btnType?: string
  btnStyle?: string
  amapKey?: string
}

/** 环境配置映射表 */
export interface PathConfigMap {
  [envName: string]: EnvConfig
}

/** 低代码页面配置 */
export interface PageConfig {
  page_no: string
  page_name: string
  page_title: string
  app_no?: string
  content_area_width?: number | string
  page_style_json?: string
  page_style_json_data?: Record<string, unknown>
  page_row_json?: string
  page_row_json_data?: PageRowData
  app_json_data?: AppConfig
  srv_req_json?: string
  srv_req_json_data?: Record<string, unknown>
  interface_json_data?: InterfaceParam[]
  cols_map_json_data?: Record<string, string>
  para_json?: InterfaceParam[]
  para_with_map_json_data?: InterfaceParamV2[]
  page_options?: string
}

/** 页面布局数据 */
export interface PageRowData {
  component_json?: ComponentConfig[]
}

/** 低代码组件配置 */
export interface ComponentConfig {
  id: string
  com_no: string
  com_name: string
  com_type: string
  com_seq: number
  parent_no?: string
  com_option?: string
  com_label?: string
  component?: string
  type?: string
  data?: Record<string, unknown>
  children?: ComponentConfig[]
  layout_width?: number
  layout_height?: number
  layout_x?: number
  layout_y?: number
  layout_z?: number
  display?: string
  _editType?: string
  _raw_data?: Record<string, unknown>
  [key: string]: unknown
}

/** 应用配置 */
export interface AppConfig {
  app_no: string
  app_name: string
  app_style_json?: string
  current_theme?: string
  theme_list?: ThemeItem[]
}

/** 主题项 */
export interface ThemeItem {
  name: string
  variable?: Record<string, string>
}

/** 接口参数 */
export interface InterfaceParam {
  para: string
  para_name?: string
  default_val?: string
  dim_no?: string
  value?: string
}

/** V2 接口参数 */
export interface InterfaceParamV2 {
  para: string
  default_val?: string
  value?: string
}

/** 页面参数模型 */
export interface PageParamsModel {
  [key: string]: {
    value: unknown
    [key: string]: unknown
  }
}

/** API 响应 */
export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  msg?: string
  page?: { pageNo: number; rownumber: number; total: number }
}
