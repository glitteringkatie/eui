import React, {
  FunctionComponent,
  ReactChild,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';

import { CommonProps } from '../../common';
import {
  getPositionFromStop,
  getStopFromMouseLocation,
  isColorInvalid,
  isStopInvalid,
} from './utils';
import { useMouseMove, getChromaColor } from '../utils';
import { keyCodes } from '../../../services';

import { EuiButtonIcon } from '../../button';
import { EuiColorPicker, EuiColorPickerProps } from '../color_picker';
import { EuiFlexGroup, EuiFlexItem } from '../../flex';
import { EuiFieldNumber, EuiFieldText, EuiFormRow } from '../../form';
import { EuiI18n } from '../../i18n';
import { EuiPopover } from '../../popover';
import { EuiScreenReaderOnly } from '../../accessibility';
import { EuiSpacer } from '../../spacer';
import { EuiRangeThumb } from '../../form/range/range_thumb';

export interface ColorStop {
  stop: number;
  color: string;
}

interface EuiColorStopThumbProps extends CommonProps, ColorStop {
  className?: string;
  onChange: (colorStop: ColorStop) => void;
  onFocus?: () => void;
  onRemove?: () => void;
  globalMin: number;
  globalMax: number;
  localMin: number;
  localMax: number;
  min?: number;
  max?: number;
  isRangeMin?: boolean;
  isRangeMax?: boolean;
  parentRef?: HTMLDivElement | null;
  colorPickerMode: EuiColorPickerProps['mode'];
  colorPickerShowAlpha?: EuiColorPickerProps['showAlpha'];
  colorPickerSwatches?: EuiColorPickerProps['swatches'];
  disabled?: boolean;
  readOnly?: boolean;
  isPopoverOpen: boolean;
  openPopover: () => void;
  closePopover: () => void;
  'data-index'?: string;
  'aria-valuetext'?: string;
}

export const EuiColorStopThumb: FunctionComponent<EuiColorStopThumbProps> = ({
  className,
  stop,
  color,
  onChange,
  onFocus,
  onRemove,
  globalMin,
  globalMax,
  localMin,
  localMax,
  min,
  max,
  isRangeMin = false,
  isRangeMax = false,
  parentRef,
  colorPickerMode,
  colorPickerShowAlpha,
  colorPickerSwatches,
  disabled,
  readOnly,
  isPopoverOpen,
  openPopover,
  closePopover,
  'data-index': dataIndex,
  'aria-valuetext': ariaValueText,
}) => {
  const background = useMemo(() => {
    const chromaColor = getChromaColor(color, colorPickerShowAlpha);
    return chromaColor ? chromaColor.css() : undefined;
  }, [color, colorPickerShowAlpha]);
  const [hasFocus, setHasFocus] = useState(isPopoverOpen);
  const [colorIsInvalid, setColorIsInvalid] = useState(
    isColorInvalid(color, colorPickerShowAlpha)
  );
  const [stopIsInvalid, setStopIsInvalid] = useState(isStopInvalid(stop));
  const [numberInputRef, setNumberInputRef] = useState();
  const popoverRef = useRef<EuiPopover>(null);

  useEffect(() => {
    if (isPopoverOpen && popoverRef && popoverRef.current) {
      popoverRef.current.positionPopoverFixed();
    }
  }, [isPopoverOpen, stop]);

  const getStopFromMouseLocationFn = (location: { x: number; y: number }) => {
    // Guard against `null` ref in usage
    return getStopFromMouseLocation(location, parentRef!, globalMin, globalMax);
  };

  const getPositionFromStopFn = (stop: ColorStop['stop']) => {
    // Guard against `null` ref in usage
    return getPositionFromStop(stop, parentRef!, globalMin, globalMax);
  };

  const handleOnRemove = () => {
    if (onRemove) {
      closePopover();
      onRemove();
    }
  };

  const handleFocus = () => {
    setHasFocus(true);
    if (onFocus) {
      onFocus();
    }
  };

  const setHasFocusTrue = () => setHasFocus(true);
  const setHasFocusFalse = () => setHasFocus(false);

  const handleColorChange = (value: ColorStop['color']) => {
    setColorIsInvalid(isColorInvalid(value, colorPickerShowAlpha));
    onChange({ stop, color: value });
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleColorChange(e.target.value);

  const handleStopChange = (value: ColorStop['stop']) => {
    const willBeInvalid = value > localMax || value < localMin;

    if (willBeInvalid) {
      if (value > localMax) {
        value = localMax;
      }
      if (value < localMin) {
        value = localMin;
      }
    }
    setStopIsInvalid(isStopInvalid(value));
    onChange({ stop: value, color });
  };

  const handleStopInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);

    const willBeInvalid = value > globalMax || value < globalMin;

    if (willBeInvalid) {
      if (value > globalMax && max != null) {
        value = globalMax;
      }
      if (value < globalMin && min != null) {
        value = globalMin;
      }
    }

    setStopIsInvalid(isStopInvalid(value));
    onChange({ stop: value, color });
  };

  const handlePointerChange = (
    location: { x: number; y: number },
    isFirstInteraction?: boolean
  ) => {
    if (isFirstInteraction) return; // Prevents change on the inital MouseDown event
    if (parentRef == null) {
      return;
    }
    const newStop = getStopFromMouseLocationFn(location);
    handleStopChange(newStop);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (e.keyCode) {
      case keyCodes.ENTER:
        e.preventDefault();
        openPopover();
        break;

      case keyCodes.LEFT:
        e.preventDefault();
        if (readOnly) return;
        handleStopChange(stop - 1);
        break;

      case keyCodes.RIGHT:
        e.preventDefault();
        if (readOnly) return;
        handleStopChange(stop + 1);
        break;
    }
  };

  const [handleMouseDown, handleInteraction] = useMouseMove<HTMLButtonElement>(
    handlePointerChange
  );

  const handleOnMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!readOnly) {
      handleMouseDown(e);
    }
    openPopover();
  };

  const handleTouchInteraction = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (!readOnly) {
      handleInteraction(e);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    handleTouchInteraction(e);
    openPopover();
  };

  const classes = classNames(
    'euiColorStopPopover',
    {
      'euiColorStopPopover-hasFocus': hasFocus || isPopoverOpen,
    },
    className
  );

  // console.log('render', stop);

  return (
    <EuiPopover
      ref={popoverRef}
      className={classes}
      anchorClassName="euiColorStopPopover__anchor"
      panelPaddingSize="s"
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      ownFocus={isPopoverOpen}
      initialFocus={numberInputRef}
      panelClassName={
        numberInputRef ? undefined : 'euiColorStopPopover-isLoadingPanel'
      }
      style={{
        left: `${getPositionFromStopFn(stop)}%`,
      }}
      button={
        <EuiI18n
          tokens={[
            'euiColorStopThumb.buttonAriaLabel',
            'euiColorStopThumb.buttonTitle',
          ]}
          defaults={[
            'Press the Enter key to modify this stop. Press Escape to focus the group',
            'Click to edit, drag to reposition',
          ]}>
          {([buttonAriaLabel, buttonTitle]: ReactChild[]) => {
            const ariaLabel = buttonAriaLabel as string;
            const title = buttonTitle as string;
            return (
              <EuiRangeThumb
                data-test-subj="euiColorStopThumb"
                data-index={dataIndex}
                min={localMin}
                max={localMax}
                value={stop}
                onFocus={handleFocus}
                onBlur={setHasFocusFalse}
                onMouseOver={setHasFocusTrue}
                onMouseOut={setHasFocusFalse}
                onKeyDown={handleKeyDown}
                onMouseDown={handleOnMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchInteraction}
                aria-valuetext={ariaValueText}
                aria-label={ariaLabel}
                title={title}
                className="euiColorStopThumb"
                tabIndex={-1}
                style={{
                  background,
                }}
                disabled={disabled}
              />
            );
          }}
        </EuiI18n>
      }>
      <div className="euiColorStop" data-test-subj="euiColorStopPopover">
        <EuiScreenReaderOnly>
          <p aria-live="polite">
            <EuiI18n
              token="euiColorStopThumb.screenReaderAnnouncement"
              default="A popup with a color stop edit form opened.
            Tab forward to cycle through form controls or press
            escape to close this popup."
            />
          </p>
        </EuiScreenReaderOnly>
        <EuiFlexGroup gutterSize="s" responsive={false}>
          <EuiFlexItem>
            <EuiI18n
              tokens={[
                'euiColorStopThumb.stopLabel',
                'euiColorStopThumb.stopErrorMessage',
              ]}
              defaults={['Stop value', 'Value is out of range']}>
              {([stopLabel, stopErrorMessage]: React.ReactChild[]) => (
                <EuiFormRow
                  label={stopLabel}
                  display="rowCompressed"
                  isInvalid={stopIsInvalid}
                  error={stopIsInvalid ? stopErrorMessage : null}>
                  <EuiFieldNumber
                    inputRef={setNumberInputRef}
                    compressed={true}
                    readOnly={readOnly}
                    min={isRangeMin || min == null ? undefined : localMin}
                    max={isRangeMax || max == null ? undefined : localMax}
                    value={isStopInvalid(stop) ? '' : stop}
                    isInvalid={stopIsInvalid}
                    onChange={handleStopInputChange}
                  />
                </EuiFormRow>
              )}
            </EuiI18n>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFormRow display="rowCompressed" hasEmptyLabelSpace={true}>
              <EuiI18n
                token="euiColorStopThumb.removeLabel"
                default="Remove this stop">
                {(removeLabel: string) => (
                  <EuiButtonIcon
                    iconType="trash"
                    color="danger"
                    aria-label={removeLabel}
                    title={removeLabel}
                    disabled={!onRemove || readOnly}
                    onClick={handleOnRemove}
                  />
                )}
              </EuiI18n>
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
        {!readOnly && (
          <React.Fragment>
            <EuiSpacer size="m" />
            <EuiColorPicker
              onChange={handleColorChange}
              color={color}
              mode={colorPickerMode}
              swatches={colorPickerSwatches}
              display="inline"
              showAlpha={colorPickerShowAlpha}
            />
          </React.Fragment>
        )}
        {colorPickerMode !== 'swatch' && (
          <React.Fragment>
            <EuiSpacer size="s" />
            <EuiI18n
              tokens={[
                'euiColorStopThumb.hexLabel',
                'euiColorStopThumb.hexErrorMessage',
              ]}
              defaults={['Color', 'Invalid color value']}>
              {([hexLabel, hexErrorMessage]: React.ReactChild[]) => (
                <EuiFormRow
                  label={hexLabel}
                  display="rowCompressed"
                  isInvalid={colorIsInvalid}
                  error={colorIsInvalid ? hexErrorMessage : null}>
                  <EuiFieldText
                    compressed={true}
                    readOnly={readOnly}
                    value={color}
                    isInvalid={colorIsInvalid}
                    onChange={handleColorInputChange}
                  />
                </EuiFormRow>
              )}
            </EuiI18n>
          </React.Fragment>
        )}
      </div>
    </EuiPopover>
  );
};
