/** 用户对象类型 */
export enum TargetType {
  /** 外部用户 */
  'Group' = '集团',
  'Cohort' = '群组',
  /** 内部用户 */
  'College' = '学院',
  'Department' = '部门',
  'Office' = '办事处',
  'Section' = '科室',
  'Major' = '专业',
  'Working' = '工作组',
  'Research' = '研究所',
  'Laboratory' = '实验室',
  /** 岗位 */
  'Station' = '岗位',
  /** 自归属用户 */
  'Person' = '人员',
  'Company' = '单位',
  'University' = '大学',
  'Hospital' = '医院',
}

/** 分类基础类型 */
export enum SpeciesType {
  /** 类别目录 */
  'FileSystem' = '文件系统',
  'AppPackage' = '应用类别',
  'Market' = '流通市场',
  'Resource' = '服务资源',
  'Store' = '仓库物资',
  'PropClass' = '属性分类',
  /** 类别类目 */
  'Thing' = '财务分类',
  'Species' = '货品类别',
  'SpeciesForm' = '表单类别',
  'Directory' = '文件目录',
  'Application' = '软件应用',
  'AppModule' = '应用模块',
  'WorkItem' = '应用办事',
  'WorkForm' = '应用表单',
  'ReportBI' = '应用报表',
}

/** 消息类型 */
export enum MessageType {
  File = '文件',
  Text = '文本',
  Image = '图片',
  Video = '视频',
  Voice = '语音',
  Recall = '撤回',
  Readed = '已读',
}
