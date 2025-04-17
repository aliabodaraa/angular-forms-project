import {
  ARRAY,
  childSkeleton,
  DynamicControl,
  DynamicFormConfig,
} from '../dynamic-forms';

export function buildDesiredObjectStructure(
  childSkeleton: childSkeleton,
  lastOrder: number = 0,
  value?: any,
  label?: string
): any {
  let newCtrl = {};
  if (childSkeleton.controlType === 'input') {
    newCtrl = {
      controlType: childSkeleton.controlType,
      label: label ? label : `${childSkeleton.controlType}${lastOrder + 1}`,
      value: value ? value : childSkeleton.defaultValue,
      type: childSkeleton.type,
      order: lastOrder++,
    };
  } else if (childSkeleton.controlType === 'group') {
    let group = childSkeleton.controls;
    let ctrls = {};
    Object.values(group).forEach((ctrl, index) => {
      const ctrlName = Object.keys(group)[index];
      ctrls = {
        ...ctrls,
        [ctrlName]: buildDesiredObjectStructure(
          ctrl,
          index,
          value?.[ctrlName],
          label
        ) as DynamicControl,
      };
    });
    newCtrl = {
      controlType: childSkeleton.controlType,
      label: `${childSkeleton.defaultLabel || ''} ${lastOrder + 1}`,
      order: lastOrder,
      controls: ctrls,
    };
  } else if (childSkeleton.controlType === 'array') {
    let array = childSkeleton.controls;
    let ctrls: ARRAY['controls'] = [];
    array.forEach((ctrl, index) => {
      ctrls.push(
        buildDesiredObjectStructure(
          ctrl,
          index,
          value?.[index],
          label
        ) as DynamicControl
      );
    });
    newCtrl = {
      controlType: childSkeleton.controlType,
      label: `${childSkeleton.defaultLabel || ''} ${lastOrder + 1}`,
      order: lastOrder,
      controls: ctrls,
      isAddable: childSkeleton.isAddable,
      isRemovable: childSkeleton.isRemovable,
    };
  }

  return newCtrl;
}

export function adaptJsonConfigWithEnteredValues(
  formConfig: DynamicFormConfig,
  values: any
) {
  for (const key in formConfig.controls) {
    const element = formConfig.controls[key];
    if (element.controlType === 'group') {
      let index = 0;
      for (const fieldKey in values[key]) {
        element.controls = {
          ...element.controls,
          [fieldKey]: buildDesiredObjectStructure(
            (element as any)['childSkeleton'],
            index,
            values[key][fieldKey],
            fieldKey
          ),
        };
        index++;
      }
    } else if (element.controlType === 'array') {
      let index = 0;
      for (const fieldKey in values[key]) {
        element.controls.push(
          buildDesiredObjectStructure(
            (element as any)['childSkeleton'],
            index,
            values[key][fieldKey]
          ) as any
        );
        index++;
      }
    }
  }
  return formConfig;
}
