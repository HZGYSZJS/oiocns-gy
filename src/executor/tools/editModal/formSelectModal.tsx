import { Modal } from 'antd';
import React from 'react';
import { kernel, model, schema } from '@/ts/base';
import { IBelong } from '@/ts/core';
import GenerateTable from '../generate/table';
import CustomStore from 'devextreme/data/custom_store';
import EntityIcon from '@/components/Common/GlobalComps/entityIcon';

interface IFormSelectProps {
  form: schema.XForm;
  fields: model.FieldModel[];
  belong: IBelong;
  onSave: (values: model.AnyThingModel[]) => void;
}

const FormSelectModal = ({ form, fields, belong, onSave }: IFormSelectProps) => {
  const editData: { rows: model.AnyThingModel[] } = { rows: [] };
  const modal = Modal.confirm({
    icon: <EntityIcon entityId={form.id} showName />,
    width: '80vw',
    okText: `确认选择`,
    cancelText: '关闭',
    onCancel: () => modal.destroy(),
    content: (
      <GenerateTable
        form={form}
        fields={fields}
        autoColumn
        height={'70vh'}
        toolbar={{ visible: false }}
        selection={{
          mode: 'multiple',
          allowSelectAll: true,
          selectAllMode: 'page',
          showCheckBoxesMode: 'always',
        }}
        onSelectionChanged={(e) => {
          editData.rows = e.selectedRowsData;
        }}
        dataSource={
          new CustomStore({
            key: 'Id',
            async load(loadOptions) {
              loadOptions.userData = [];
              let request: any = { ...loadOptions };
              const result = await kernel.anystore.loadThing<model.AnyThingModel>(
                belong.id,
                request,
              );
              if (result.success) {
                return result.data;
              }
              return [];
            },
          })
        }
        remoteOperations={true}
      />
    ),
    onOk: () => {
      modal.destroy();
      onSave(editData.rows);
    },
  });
};

export default FormSelectModal;