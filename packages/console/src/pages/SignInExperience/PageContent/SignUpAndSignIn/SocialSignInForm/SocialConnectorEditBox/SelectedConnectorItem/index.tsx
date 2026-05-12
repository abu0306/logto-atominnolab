import Draggable from '@/assets/icons/draggable.svg?react';
import Minus from '@/assets/icons/minus.svg?react';
import ConnectorLogo from '@/components/ConnectorLogo';
import UnnamedTrans from '@/components/UnnamedTrans';
import Checkbox from '@/ds-components/Checkbox';
import IconButton from '@/ds-components/IconButton';
import ConnectorPlatformIcon from '@/icons/ConnectorPlatformIcon';
import type { ConnectorGroup } from '@/types/connector';

import styles from './index.module.scss';

type Props = {
  readonly data: ConnectorGroup;
  readonly isHidden: boolean;
  readonly onHiddenChange: (connectorTarget: string, isHidden: boolean) => void;
  readonly onDelete: (connectorTarget: string) => void;
};

function SelectedConnectorItem({
  data: { logo, logoDark, target, name, connectors },
  isHidden,
  onHiddenChange,
  onDelete,
}: Props) {
  return (
    <div className={styles.item}>
      <div className={styles.info}>
        <Draggable className={styles.draggableIcon} />
        <ConnectorLogo data={{ logo, logoDark }} size="small" />
        <UnnamedTrans resource={name} className={styles.name} />
        {connectors.length > 1 &&
          connectors.map(({ platform }) => (
            <div key={platform} className={styles.icon}>
              {platform && <ConnectorPlatformIcon platform={platform} />}
            </div>
          ))}
        <Checkbox
          className={styles.hiddenCheckbox}
          checked={isHidden}
          label="Hide on sign-in"
          onChange={(checked) => {
            onHiddenChange(target, checked);
          }}
        />
      </div>
      <IconButton
        onClick={() => {
          onDelete(target);
        }}
      >
        <Minus />
      </IconButton>
    </div>
  );
}

export default SelectedConnectorItem;
