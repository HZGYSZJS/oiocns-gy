import OioForm from '@/bizcomponents/FormDesign/OioForm';
import { ProColumnType, ProTableProps } from '@ant-design/pro-components';
import type { ParamsType } from '@ant-design/pro-provider';
import { Button, Modal } from 'antd';
import React, { ReactNode, useEffect, useState } from 'react';
import { kernel, schema } from '@/ts/base';
import orgCtrl from '@/ts/controller';
import { MakePropertysToAttrMap, submitCurrentTableData } from '../funs';
import { toolBtnsType, OperateType } from '../const';
import BaseThing from '../BaseThing';
import SelectThing from '../TreeSelectThing';

interface IProps {
  labels: string[];
  propertys: schema.XProperty[];
  belongId: string;
  selectable?: boolean;
  height?: any;
  width?: any;
  keyMap?: Map<string, string>; //存放当前表单 属性id=>特性id
  readonly?: boolean; //只读表单，隐藏操作区，配置区
  setSelectedRows?: (data: any) => void;
  current?: any;
  onListChange?: Function;
  form: schema.XForm; //传进来的 表单基本信息
  defaultColums?: any[]; //传进来的 表头设置
  toolBtnItems?: toolBtnsType;
}

const ThingTable = <
  DataType extends Record<string, any>,
  Params extends ParamsType = ParamsType,
  ValueType = 'text',
>(
  props: ProTableProps<DataType, Params, ValueType> & IProps,
) => {
  const {
    rowKey = 'Id',
    belongId,
    propertys,
    dataSource = [],
    // defaultColums,
    current,
    form,
    labels,
    onListChange,
    readonly,
    toolBtnItems = [],
    ...rest
  } = props;

  const [thingList, setThingList] = useState<any[]>(dataSource as []);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [operateModel, setOperateModel] = useState<OperateType>('' as OperateType.Add);
  const [EditData, setEditData] = useState<any>({});
  const [changeData, setChangeData] = useState<any>({});
  const defaultColumnStateMap: any = {
    ModifiedTime: {
      width: 100,
      show: false,
    },
    CreateTime: {
      show: false,
    },
  };

  const Operation: ProColumnType<any> = {
    title: '操作',
    valueType: 'option',
    width: 200,
    render: (_text, record, _, _action) => [
      <a
        key="Editable"
        onClick={() => {
          const { EDIT_INFO = {}, ...rest } = record;
          setEditData({ ...rest, ...EDIT_INFO });
          setOperateModel(OperateType.Edit);
        }}>
        变更
      </a>,
      <a
        key="delete"
        onClick={() => {
          setThingList(thingList.filter((item) => item.Id !== record.Id));
        }}>
        移除
      </a>,
    ],
  };

  useEffect(() => {
    const keyMap: Map<string, string> = MakePropertysToAttrMap(propertys);

    // 监听实体选择 将实体属性转为表格展示特性
    if (selectedRows.length > 0) {
      const thingListIds = thingList.map((v) => v.Id);
      let newSelected = selectedRows
        .filter((s: { Id: string }) => !thingListIds.includes(s.Id))
        .map((item: any) => {
          let obj: { [key: string]: any } = {};
          Object.keys(item).forEach((key) => {
            if (
              [
                'Id',
                'Creater',
                'Status',
                'CreateTime',
                'ModifiedTime',
                'Species',
              ].includes(key)
            ) {
              obj[key] = item[key];
            } else {
              keyMap.has(key) && (obj[keyMap.get(key)!] = item[key]);
            }
          });
          return obj;
        });

      setThingList([...newSelected, ...thingList]);
    }
  }, [selectedRows]);
  useEffect(() => {
    // 监听展示数据变化。弹出数据给父级
    setTimeout(() => {
      submitCurrentTableData(form, thingList, propertys, onListChange);
    }, 100);
  }, [thingList]);

  // 触发弹窗 关闭事件
  const handleModalDataChange = async (type: OperateType) => {
    switch (type) {
      case OperateType.Add:
        {
          if (Object.keys(changeData).length == 0) {
            break;
          }
          let res = await kernel.anystore.createThing(orgCtrl.user.id, 1);
          const { success, data = [] }: any = res;
          if (success && data.length > 0) {
            const _Data = { ...data[0], EDIT_INFO: changeData };
            setThingList([_Data, ...thingList]);
          }
        }
        break;
      case OperateType.Edit:
        {
          const _DataSource = thingList.map((item) => {
            item.Id === EditData.Id &&
              (item = {
                ...item,
                EDIT_INFO: { ...(item?.EDIT_INFO ?? {}), ...changeData },
              });

            return item;
          });
          setThingList(_DataSource);
        }
        break;
      case OperateType.EditMore:
        {
          const _DataSource = thingList.map((item) => {
            return {
              ...item,
              EDIT_INFO: { ...(item?.EDIT_INFO ?? {}), ...changeData },
            };
          });
          setThingList(_DataSource);
        }
        break;

      default:
        break;
    }
    setOperateModel('' as OperateType.Add);
  };
  // 获取自定义按钮组
  const HandleToolBarRender: () => ReactNode[] = () => {
    const dom: ReactNode[] = toolBtnItems.map((item, idx) => {
      if (typeof item == 'string') {
        return (
          <Button
            key={idx}
            type="default"
            style={{ maxWidth: '150px', textOverflow: 'ellipsis', overflow: 'hidden' }}
            onClick={() => {
              setChangeData({});
              console.log('dianji', item);

              setOperateModel(item as OperateType.Add);
            }}>
            {item ?? '--'}
            {form?.name}
          </Button>
        );
      }
      return item as ReactNode;
    });
    return dom;
  };
  return (
    <>
      {/* 实体表格区域 */}
      <BaseThing
        Operation={Operation}
        propertys={propertys}
        rowKey={rowKey}
        key={thingList.length}
        size="small"
        colKey={'attrId'}
        dataSource={[...thingList]}
        columnsState={{ ...defaultColumnStateMap }}
        toolBarRender={readonly ? undefined : (HandleToolBarRender as any)}
        {...rest}
      />
      {/* 弹窗区域 */}
      <>
        {current && (
          <Modal
            open={[OperateType.Add, OperateType.Edit, OperateType.EditMore].includes(
              operateModel,
            )}
            onOk={async () => {
              await handleModalDataChange(operateModel);
            }}
            onCancel={() => {
              setOperateModel('' as OperateType.Add);
            }}
            destroyOnClose={true}
            cancelText={'关闭'}
            width={1000}>
            <OioForm
              form={form}
              define={current}
              fieldsValue={operateModel === OperateType.Edit ? EditData : undefined}
              onValuesChange={(_changeValue, values) => setChangeData(values)}
              noRule={operateModel.includes('Edit')}
            />
          </Modal>
        )}
        {
          <Modal
            open={operateModel === OperateType.Select}
            onOk={() => {
              setOperateModel('' as OperateType.Add);
            }}
            onCancel={() => {
              setOperateModel('' as OperateType.Add);
            }}
            bodyStyle={{ minHeight: '600px' }}
            destroyOnClose={true}
            cancelText={'关闭'}
            width={'1200px'}>
            <SelectThing
              selectable
              labels={labels}
              current={current}
              selectedKeys={thingList.map((v: { Id: string }) => v.Id)}
              onRowSelectChange={(_keys, rows) => setSelectedRows(rows)}
              belongId={belongId}
              form={form}
            />
          </Modal>
        }
      </>
    </>
  );
};
export default ThingTable;