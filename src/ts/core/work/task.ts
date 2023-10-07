import { logger } from '@/ts/base/common';
import { IWork } from '.';
import { schema, model, kernel } from '../../base';
import { TaskStatus, storeCollName } from '../public';
import { IBelong } from '../target/base/belong';
import { UserProvider } from '../user';
import { IWorkApply, WorkApply } from './apply';

export interface IWorkTask {
  /** 唯一标识 */
  id: string;
  /** 内容 */
  content: string;
  /** 当前用户 */
  user: UserProvider;
  /** 归属空间 */
  belong: IBelong;
  /** 任务元数据 */
  metadata: schema.XWorkTask;
  /** 流程实例 */
  instance: schema.XWorkInstance | undefined;
  /** 实例携带的数据 */
  instanceData: model.InstanceDataModel | undefined;
  /** 加用户任务信息 */
  targets: schema.XTarget[];
  /** 是否满足条件 */
  isMatch(filter: string): boolean;
  /** 任务更新 */
  updated(_metadata: schema.XWorkTask): Promise<boolean>;
  /** 加载流程实例数据 */
  loadInstance(reload?: boolean): Promise<boolean>;
  /** 撤回任务 */
  recallApply(): Promise<boolean>;
  /** 创建申请(子流程) */
  createApply(): Promise<IWorkApply | undefined>;
  /** 任务审批 */
  approvalTask(status: number, comment?: string): Promise<boolean>;
}

export class WorkTask implements IWorkTask {
  constructor(_metadata: schema.XWorkTask, _user: UserProvider) {
    this.metadata = _metadata;
    this.user = _user;
  }
  user: UserProvider;
  metadata: schema.XWorkTask;
  instance: schema.XWorkInstance | undefined;
  instanceData: model.InstanceDataModel | undefined;
  get id(): string {
    return this.metadata.id;
  }
  get content(): string {
    if (this.targets.length === 2) {
      return `${this.targets[0].name}[${this.targets[0].typeName}]申请加入${this.targets[1].name}[${this.targets[1].typeName}]`;
    }
    return this.metadata.content;
  }
  get belong(): IBelong {
    for (const company of this.user.user!.companys) {
      if (company.id === this.metadata.belongId) {
        return company;
      }
    }
    return this.user.user!;
  }
  get targets(): schema.XTarget[] {
    if (this.metadata.taskType == '加用户') {
      try {
        return JSON.parse(this.metadata.content) || [];
      } catch (ex) {
        logger.error(ex as Error);
      }
    }
    return [];
  }
  isMatch(filter: string): boolean {
    return JSON.stringify(this.metadata).includes(filter);
  }
  async updated(_metadata: schema.XWorkTask): Promise<boolean> {
    if (this.metadata.id === _metadata.id) {
      this.metadata = _metadata;
      await this.loadInstance(true);
      return true;
    }
    return false;
  }
  async loadInstance(reload: boolean = false): Promise<boolean> {
    if (this.instanceData !== undefined && !reload) return true;
    const res = await kernel.collectionLoad<schema.XWorkInstance[]>(
      this.metadata.belongId,
      [],
      {
        collName: storeCollName.WorkInstance,
        options: {
          match: {
            id: this.metadata.instanceId,
          },
          limit: 1,
          lookup: {
            from: storeCollName.WorkTask,
            localField: 'id',
            foreignField: 'instanceId',
            as: 'tasks',
          },
        },
      },
    );
    if (res.data && res.data.length > 0) {
      try {
        this.instance = res.data[0];
        this.instanceData = this.instance ? JSON.parse(this.instance.data) : undefined;
        return this.instanceData !== undefined;
      } catch (ex) {
        logger.error(ex as Error);
      }
    }
    return false;
  }
  async recallApply(): Promise<boolean> {
    if ((await this.loadInstance()) && this.instance) {
      if (this.instance.createUser === this.belong.userId) {
        if (await kernel.recallWorkInstance({ id: this.instance.id })) {
          return true;
        }
      }
    }
    return false;
  }
  async approvalTask(status: number, comment: string): Promise<boolean> {
    if (this.metadata.status < TaskStatus.ApprovalStart) {
      if (status === -1) {
        return await this.recallApply();
      }
      if (this.metadata.taskType === '加用户' || (await this.loadInstance(true))) {
        const res = await kernel.approvalTask({
          id: this.metadata.id,
          status: status,
          comment: comment,
          data: JSON.stringify(this.instanceData),
        });
        if (res.data && status < TaskStatus.RefuseStart) {
          if (this.targets && this.targets.length === 2) {
            for (const item of this.user.targets) {
              if (item.id === this.targets[1].id) {
                item.pullMembers([this.targets[0]]);
                break;
              }
            }
          }
        }
      }
    }
    return false;
  }
  async createApply(): Promise<IWorkApply | undefined> {
    if (this.metadata.approveType == '子流程') {
      var define = await this.findWorkById(this.metadata.defineId);
      if (define && (await define.loadWorkNode())) {
        const data: model.InstanceDataModel = {
          data: this.instanceData?.data!,
          fields: {},
          primary: {},
          node: define.node!,
          allowAdd: define.metadata.allowAdd,
          allowEdit: define.metadata.allowEdit,
          allowSelect: define.metadata.allowSelect,
        };
        define.primaryForms.forEach((form) => {
          data.fields[form.id] = form.fields;
        });
        return new WorkApply(
          {
            hook: '',
            taskId: this.id,
            title: define.name,
            defineId: define.id,
            applyId: this.instance!.shareId,
          } as model.WorkInstanceModel,
          data,
          define.application.directory.target.space,
          [...define.primaryForms, ...define.detailForms],
        );
      }
    }
  }

  private async findWorkById(wrokId: string): Promise<IWork | undefined> {
    for (var target of this.user.targets) {
      for (var app of await target.directory.loadAllApplication()) {
        const works = await app.loadWorks();
        const work = works.find((a) => a.metadata.id === wrokId);
        if (work) {
          return work;
        }
      }
    }
  }
}
