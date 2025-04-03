# 📌 Simplifying the Usage of Reactive Forms in Angular

## ✨ Introduction

This Angular library is designed to streamline the usage of Reactive Forms by providing a structured JSON-based configuration. Instead of manually defining form controls and groups, developers can dynamically configure various types of form elements, including basic `inputs`, `groups`, `arrays`, `checkboxes`,`select`,`radios` and more. This approach significantly enhances form management, making it more efficient and maintainable.

With this library, you can:

- Define forms dynamically with minimal effort.

- Handle complex form structures, including nested groups and - arrays.

- Utilize built-in validation and dynamic UI generation.

- Improve form reusability and maintainability in Angular applications.

---

## 📖 Table of Contents

- [🌟 Overview](#-overview)
- [📝 JSON Structure](#-json-structure)
- [📦 Supported Cases](#-supported-cases)
  - [Case 1: Basic Input Fields](#case-1-basic-input-fields)
  - [Case 2: Select Dropdown](#case-2-select-dropdown)
  - [Case 3: Grouped Fields](#case-3-grouped-fields)
  - [Case 4: Checkbox Fields](#case-4-checkbox-fields)
  - [Case 5: Form Arrays](#case-5-form-arrays)
  - [Case 6: Nested Complex Arrays](#case-6-nested-complex-arrays)

---

## 🌟 Overview

This library provides an easy way to define Reactive Forms using a JSON configuration. The form structure follows a well-defined syntax where each input field, group, and array is configured inside a `controls` object.

### 🛠 JSON Structure

```json
{
  "description": "User form configuration",
  "controls": {
    "email": {...},
    "role": {...},
    "socialProfiles": {...},
    "terms": {...},
    "ArrayOfControls": {...},
    "Gender": {...}
  }
}
```

Each control follows a standard schema that defines:

- `controlType`: Specifies the type of input (e.g., `input`, `select`, `checkbox`, `radio`, `group`, `array`).
- `label`: The field label.
- `value`: Default value.
- `order`: The position of the field.
- `validators`: Validation rules.
- Additional properties based on control type.

---

## 📦 Supported Cases

### **Case 1: Basic Input Fields**

A simple text and email input field definition.

```json
{
  "fullName": {
    "controlType": "input",
    "type": "text",
    "label": "Full Name",
    "value": "John Doe",
    "order": 0,
    "validators": {
      "required": true,
      "minLength": 2
    }
  },
  "email": {
    "controlType": "input",
    "type": "email",
    "label": "Email",
    "value": "example@mail.com",
    "order": 1,
    "validators": {
      "email": true
    }
  }
}
```

✅ **Use case:** Standard form inputs with validation.

---

### **Case 2: Select Dropdown**

A dropdown to select a role from predefined options.

```json
{
  "role": {
    "controlType": "select",
    "label": "User Role",
    "value": "editor",
    "order": 2,
    "options": [
      { "label": "Admin", "value": "admin" },
      { "label": "Editor", "value": "editor" },
      { "label": "Guest", "value": "guest" }
    ]
  }
}
```

✅ **Use case:** Dropdown selections.

---

### **Case 3: Grouped Fields**

A set of fields grouped together.

```json
{
  "socialProfiles": {
    "controlType": "group",
    "label": "Social Profiles",
    "order": 3,
    "controls": {
      "twitter": { "controlType": "input", "label": "Twitter", "type": "text", "order": 0 },
      "instagram": { "controlType": "input", "label": "Instagram", "type": "text", "order": 1 }
    }
  }
}
```

✅ **Use case:** Grouping related inputs.

---

### **Case 4: Checkbox Fields**

A checkbox to confirm terms & conditions.

```json
{
  "terms": {
    "controlType": "checkbox",
    "label": "Accept Terms & Conditions",
    "value": false,
    "order": 4,
    "validators": { "requiredTrue": true }
  }
}
```

### **Case 5: Radio Buttons Fields**

Radios can be added to the ctrlValues as needed.

```json
{
  "Gender": {
    "controlType": "radio",
    "label": "Gender",
    "value": "female",
    "order": 9,
    "type": "radio",
    "validators": {
      "required": true
    },
    "ctrlValues": [
      {
        "label": "Male",
        "value": "male",
        "order": 0
      },
      {
        "label": "Female",
        "value": "female",
        "order": 1
      }
    ]
  }
}
```

✅ **Use case:** Required agreements.

---

### **Case 5: Form Arrays**

A Form Array is useful when you need to create dynamic sets of similar form controls (e.g., an array of phone numbers, emails, or items). It allows adding or removing form controls dynamically at runtime.

### **Case 5.1: Form Array With Controls**

An array of input fields for multiple phone numbers. The childArrayStructure defines the structure of each control that will be added to the array.

```json
{
  "ArrayWithControls": {
    "controlType": "array",
    "label": "Phone Numbers",
    "order": 5,
    "childArrayStructure": {
      "controlType": "input",
      "type": "number"
    },
    "controls": [
      { "label": "Phone 1", "value": "123456789" },
      { "label": "Phone 2", "value": "987654321" }
    ]
  }
}
```

In this case, the childArrayStructure object specifies that each form control added to the array will be an input field of type number, with a default value of 22. The component responsible for creating the FormArray uses this configuration to dynamically generate the correct form controls.

**What does childArrayStructure do ?**
The childArrayStructure property tells the component how to create each form control within the array. It defines the type, validation, and any other necessary properties of the control or group that will be dynamically added. The array's controls are then populated based on this structure.
By using childArrayStructure, you have complete flexibility in specifying the shape of the form controls or groups within a FormArray, enabling dynamic form generation based on the configuration.

---

✅ **Use case:** Repeating fields.

---

### **Case 6: Form Array With Groups**

If you need to create complex nested structures within the Form Array, you can define a group within the childArrayStructure.

```json
{
  "ArrayWithGroups": {
    "controlType": "array",
    "label": "Phone Groups",
    "order": 6,
    "childArrayStructure": {
      "controlType": "group",
      "controls": {
        "label": { "controlType": "input", "type": "text" },
        "phoneNumber": { "controlType": "input", "type": "number" }
      }
    }
  }
}
```

In this example, the childArrayStructure defines a group, and each element of the array will contain both a label and a phoneNumber input field.

✅ **Use case:** Structured nested forms.

---

### **Case 7: Form Array With Groups**

A complex nested structure with groups inside an array.

```json
  "ArrayWithComplexGroups": {
    "controlType": "array",
    "label": "Links to your complex Phones section numbers",
    "order": 7,
    "childArrayStructure": {
      "defaultCreationLabel": "Nested Array Of Complex Groups",
      "controlType": "group",
      "controls": {
        "phoneNumber": {
          "defaultCreationLabel": "Nested phoneNumber",
          "controlType": "group",
          "controls": {
            "label": {
              "controlType": "input",
              "type": "number",
              "defaultCreationValue": 1,
              "defaultCreationLabel": "phone label"
            },
            "phoneNumber": {
              "controlType": "input",
              "type": "number",
              "defaultCreationValue": 2,
              "defaultCreationLabel": "phone label"
            }
          }
        }
      }
    },
    "controls": [
      {
        "controlType": "group",
        "label": "Phone Group 1",
        "order": 0,
        "controls": {
          "phoneNumber": {
            "controlType": "group",
            "label": "Nested Phone Group 2",
            "controls": {
              "label": {
                "controlType": "input",
                "label": "phone label 1",
                "value": "0933751751",
                "type": "text",
                "order": 0
              },
              "phoneNumber": {
                "controlType": "input",
                "label": "phone 1",
                "value": "0962636524",
                "type": "number",
                "order": 1
              }
            }
          }
        }
      }
    ]
  }
```

✅ **Use case:** Structured nested forms.

---

### **Case 8: Form Array With FormArrays**

A complex nested structure with groups inside an array.

```json
"ArrayWithFormArrays": {
      "controlType": "array",
      "label": "Links to your complex Phones section numbers",
      "order": 8,
      "childArrayStructure": {
        "defaultCreationLabel": "Array Of Array",
        "controlType": "array",
        "isRemovable": true,
        "isAddable": true,
        "childArrayStructure": {
          "controlType": "input",
          "type": "number",
          "defaultCreationValue": 22
        },
        "controls": [
          {
            "controlType": "input",
            "type": "number",
            "defaultCreationValue": "0944661224"
          },
          {
            "controlType": "input",
            "type": "number",
            "defaultCreationValue": "0944661224"
          }
        ]
      },
      "controls": [
        {
          "controlType": "array",
          "label": "Array Of Array 1",
          "isRemovable": true,
          "isAddable": true,
          "controls": [
            {
              "controlType": "input",
              "label": "phone label 1",
              "value": "0933751751",
              "type": "text",
              "order": 0
            },
            {
              "controlType": "input",
              "label": "phone label 2",
              "value": "0933751751",
              "type": "text",
              "order": 1
            }
          ]
        }
      ]
    }
```

✅ **Use case:** Structured nested forms.

---

## 📜 Validation Rules

To apply validation rules, consumers can configure them using an exposed Injection Token called `VALIDATION_ERROR_MESSAGES` as follows:

```typescript
import { VALIDATION_ERROR_MESSAGES } from "form-lib";

const ERROR_MESSAGES: { [key: string]: (args?: any) => string } = {
  required: () => "This field is required (Custom)",
  requiredTrue: () => "This field is required (Custom)",
  email: () => "It should be a valid email (Custom)",
  minlength: ({ requiredLength }) => `The length should be at least ${requiredLength} characters (Custom)`,
  banWords: ({ bannedWord }) => `The word "${bannedWord}" isn't allowed (Custom)`,
  appBanWords: ({ bannedWord }) => `The word "${bannedWord}" isn't allowed (Custom)`,
  appPasswordShouldMatch: () => "Password should match (Custom)",
  passwordShouldMatch: () => "Password should match (Custom)",
  pattern: () => "Wrong format (Custom)",
  appUniqueNickname: () => "Nickname is taken (Custom)",
  uniqueName: () => "Nickname is taken (Custom)",
};

//Every where You want in Module|standalone Imports array Yo can provide the Token and enjoy with your custom messages
providers: [{ provide: VALIDATION_ERROR_MESSAGES, useValue: ERROR_MESSAGES }],
```

---

## 🎯 Conclusion

This library streamlines the management of Reactive Forms in Angular by utilizing JSON-based configurations. It allows developers to effortlessly define a wide range of form elements, from simple inputs to complex nested arrays. By abstracting away repetitive form setup, it enhances scalability, maintainability, and efficiency, making form creation and validation a more intuitive and dynamic process.

🚀 **Start using this library today to simplify your form-building experience and boost productivity in Angular applications!**
