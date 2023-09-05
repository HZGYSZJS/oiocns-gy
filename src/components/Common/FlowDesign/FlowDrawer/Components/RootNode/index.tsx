import React, { useState } from 'react';
import { Button, Divider, Modal, Row } from 'antd';
import cls from './index.module.less';
import { NodeModel } from '../../../processType';
import ShareShowComp from '@/components/Common/ShareShowComp';
import { AiOutlineSetting } from 'react-icons/ai';
import SelectAuth from '@/components/Common/SelectAuth';
import SelectForms from '@/components/Common/SelectForms';
import { IBelong } from '@/ts/core';
import ViewFormModal from '@/components/Common/FormDesign/viewFormModal';
import { XForm } from '@/ts/base/schema';
interface IProps {
  belong: IBelong;
  current: NodeModel;
}
/**
 * @description: 角色
 * @return {*}
 */

const RootNode: React.FC<IProps> = (props) => {
  const [viewForm, setViewForm] = useState<XForm>();
  const [formModel, setFormModel] = useState<string>('');
  const [selectAuthValue, setSelectAuthValue] = useState<any>(props.current.destId);
  return (
    <div className={cls[`app-roval-node`]}>
      <div className={cls[`roval-node`]}>
        <Row style={{ marginBottom: '10px' }}>
          <AiOutlineSetting style={{ marginTop: '3px' }} />
          <span className={cls[`roval-node-title`]}>选择权限</span>
        </Row>
        <SelectAuth
          space={props.belong}
          onChange={(newValue: string, label: string) => {
            props.current.destId = newValue;
            props.current.destName = label;
            setSelectAuthValue(newValue);
          }}
          value={selectAuthValue}></SelectAuth>
        <Divider />
        <Row style={{ marginBottom: '10px' }}>
          <Button
            type="primary"
            shape="round"
            size="small"
            onClick={() => {
              setFormModel('主表');
            }}>
            选择主表
          </Button>
        </Row>
        {props.current.primaryForms.length > 0 && (
          <span>
            <ShareShowComp
              departData={props.current.primaryForms}
              onClick={(item: XForm) => {
                setViewForm(item);
              }}
              deleteFuc={(id: string) => {
                props.current.primaryForms = props.current.primaryForms?.filter(
                  (a) => a.id != id,
                );
                props.current.primaryFormIds = props.current.primaryFormIds?.filter(
                  (a) => a != id,
                );
              }}
            />
          </span>
        )}
        <Row style={{ marginBottom: '10px' }}>
          <Button
            type="primary"
            shape="round"
            size="small"
            onClick={() => {
              setFormModel('子表');
            }}>
            选择子表
          </Button>
        </Row>
        {props.current.detailForms.length > 0 && (
          <span>
            <ShareShowComp
              departData={props.current.detailForms}
              onClick={(item: XForm) => {
                setViewForm(item);
              }}
              deleteFuc={(id: string) => {
                props.current.detailForms = props.current.detailForms?.filter(
                  (a) => a.id != id,
                );
                props.current.detailFormIds = props.current.detailFormIds?.filter(
                  (a) => a != id,
                );
              }}
            />
          </span>
        )}
        {/* </div> */}
        <div>
          <Modal
            title={`选择表单`}
            width={800}
            destroyOnClose={true}
            open={formModel != ''}
            okText="确定"
            onOk={() => {
              setFormModel('');
            }}
            onCancel={() => setFormModel('')}>
            <SelectForms
              belong={props.belong}
              typeName={formModel}
              selected={
                formModel === '子表'
                  ? props.current.detailForms
                  : props.current.primaryForms
              }
              setSelected={(forms) => {
                if (formModel === '子表') {
                  props.current.detailForms = forms;
                  props.current.detailFormIds = forms.map((a) => a.id);
                } else {
                  props.current.primaryForms = forms;
                  props.current.primaryFormIds = forms.map((a) => a.id);
                }
              }}
            />
          </Modal>
          {viewForm && (
            <ViewFormModal
              form={viewForm}
              open={true}
              belong={props.belong}
              handleCancel={() => {
                setViewForm(undefined);
              }}
              handleOk={() => {
                setViewForm(undefined);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default RootNode;
