import { ARRAY, childSkeleton, DynamicControl } from '../dynamic-forms';

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
        [ctrlName]: buildDesiredObjectStructure(ctrl, index) as DynamicControl,
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
      ctrls.push(buildDesiredObjectStructure(ctrl, index) as DynamicControl);
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
