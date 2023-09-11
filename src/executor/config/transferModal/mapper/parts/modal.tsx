import FullScreenModal from '@/executor/tools/fullScreen';
import React from 'react';
import Mapper from './mapper';
import { ILink } from '@/ts/core/thing/link';
import { model } from '@/ts/base';

interface IProps {
  link: ILink;
  current: model.MappingNode;
  finished: () => void;
}

const MappingModal: React.FC<IProps> = ({ link, current, finished }) => {
  return (
    <FullScreenModal
      open
      centered
      fullScreen
      width={'80vw'}
      bodyHeight={'80vh'}
      destroyOnClose
      title={'映射配置'}
      onCancel={() => finished()}>
      <Mapper link={link} current={current} />
    </FullScreenModal>
  );
};

export default MappingModal;