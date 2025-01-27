import 'styled-components/macro';
import React, { useState } from 'react';
import { node, number, oneOfType, shape, string, arrayOf } from 'prop-types';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import {
  Split,
  SplitItem,
  TextListItemVariants,
  Button,
  Modal,
} from '@patternfly/react-core';
import { ExpandArrowsAltIcon } from '@patternfly/react-icons';
import { DetailName, DetailValue } from '../DetailList';
import MultiButtonToggle from '../MultiButtonToggle';
import Popover from '../Popover';
import {
  yamlToJson,
  jsonToYaml,
  isJsonObject,
  isJsonString,
} from '../../util/yaml';
import CodeEditor from './CodeEditor';
import { JSON_MODE, YAML_MODE } from './constants';

function VariablesDetail({
  dataCy,
  helpText,
  value,
  label,
  rows,
  fullHeight,
  i18n,
}) {
  const [mode, setMode] = useState(
    isJsonObject(value) || isJsonString(value) ? JSON_MODE : YAML_MODE
  );
  const [isExpanded, setIsExpanded] = useState(false);

  let currentValue = value;
  let error;

  const getValueInCurrentMode = () => {
    if (!value) {
      if (mode === JSON_MODE) {
        return '{}';
      }
      return '---';
    }
    const modeMatches = isJsonString(value) === (mode === JSON_MODE);
    if (modeMatches) {
      return value;
    }
    return mode === YAML_MODE ? jsonToYaml(value) : yamlToJson(value);
  };

  try {
    currentValue = getValueInCurrentMode();
  } catch (err) {
    error = err;
  }

  const labelCy = dataCy ? `${dataCy}-label` : null;
  const valueCy = dataCy ? `${dataCy}-value` : null;

  return (
    <>
      <DetailName
        data-cy={labelCy}
        id={dataCy}
        component={TextListItemVariants.dt}
        fullWidth
        css="grid-column: 1 / -1"
      >
        <ModeToggle
          id={`${dataCy}-preview`}
          label={label}
          helpText={helpText}
          dataCy={dataCy}
          mode={mode}
          setMode={setMode}
          currentValue={currentValue}
          onExpand={() => setIsExpanded(true)}
          i18n={i18n}
        />
      </DetailName>
      <DetailValue
        data-cy={valueCy}
        component={TextListItemVariants.dd}
        fullWidth
        css="grid-column: 1 / -1; margin-top: -20px"
      >
        <CodeEditor
          id={`${dataCy}-preview`}
          mode={mode}
          value={currentValue}
          readOnly
          rows={rows}
          fullHeight={fullHeight}
          css="margin-top: 10px"
        />
        {error && (
          <div
            css="color: var(--pf-global--danger-color--100);
            font-size: var(--pf-global--FontSize--sm"
          >
            {i18n._(t`Error:`)} {error.message}
          </div>
        )}
      </DetailValue>
      <Modal
        variant="xlarge"
        title={label}
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        actions={[
          <Button
            aria-label={i18n._(t`Done`)}
            key="select"
            variant="primary"
            onClick={() => setIsExpanded(false)}
            ouiaId={`${dataCy}-unexpand`}
          >
            {i18n._(t`Done`)}
          </Button>,
        ]}
      >
        <div className="pf-c-form">
          <ModeToggle
            id={`${dataCy}-preview-expanded`}
            label={label}
            helpText={helpText}
            dataCy={dataCy}
            mode={mode}
            setMode={setMode}
            currentValue={currentValue}
            i18n={i18n}
          />
          <CodeEditor
            id={`${dataCy}-preview-expanded`}
            mode={mode}
            value={currentValue}
            readOnly
            rows={rows}
            fullHeight
            css="margin-top: 10px"
          />
        </div>
      </Modal>
    </>
  );
}
VariablesDetail.propTypes = {
  value: oneOfType([shape({}), arrayOf(string), string]).isRequired,
  label: node.isRequired,
  rows: oneOfType([number, string]),
  dataCy: string,
  helpText: string,
};
VariablesDetail.defaultProps = {
  rows: null,
  dataCy: '',
  helpText: '',
};

function ModeToggle({
  id,
  label,
  helpText,
  dataCy,
  mode,
  setMode,
  onExpand,
  i18n,
}) {
  return (
    <Split hasGutter>
      <SplitItem isFilled>
        <Split hasGutter css="align-items: baseline">
          <SplitItem>
            <label className="pf-c-form__label" htmlFor={id}>
              <span
                className="pf-c-form__label-text"
                css="font-weight: var(--pf-global--FontWeight--bold)"
              >
                {label}
              </span>
              {helpText && (
                <Popover header={label} content={helpText} id={dataCy} />
              )}
            </label>
          </SplitItem>
          <SplitItem>
            <MultiButtonToggle
              buttons={[
                [YAML_MODE, 'YAML'],
                [JSON_MODE, 'JSON'],
              ]}
              value={mode}
              onChange={newMode => {
                setMode(newMode);
              }}
            />
          </SplitItem>
        </Split>
      </SplitItem>
      {onExpand && (
        <SplitItem>
          <Button
            variant="plain"
            aria-label={i18n._(t`Expand input`)}
            onClick={onExpand}
            ouiaId={`${dataCy}-expand`}
          >
            <ExpandArrowsAltIcon />
          </Button>
        </SplitItem>
      )}
    </Split>
  );
}

export default withI18n()(VariablesDetail);
