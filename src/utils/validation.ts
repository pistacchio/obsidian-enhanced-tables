import Ajv from 'ajv';

import { EtConfiguration } from 'src/utils/types';

export const VALIDATION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    'date-format': {
      type: 'string',
    },
    'datetime-format': {
      type: 'string',
    },
    'yes-format': {
      type: 'string',
    },
    'no-format': {
      type: 'string',
    },
    filter: {
      type: 'string',
    },
    sort: {
      type: 'string',
    },
    'hide-controls': {
      type: 'boolean',
    },
    'hide-configuration': {
      type: 'boolean',
    },
    style: {
      type: 'string',
    },
    editable: {
      type: 'boolean',
    },
    filters: {
      type: 'object',
      propertyNames: {
        pattern: '^.*$',
      },
      additionalProperties: {
        type: 'string',
      },
    },
    pagination: {
      type: 'object',
      properties: {
        'page-size': {
          type: 'number',
        },
        'page-sizes': {
          type: 'array',
          items: {
            type: 'number',
          },
        },
      },
      additionalProperties: false,
    },
    columns: {
      type: 'object',
      propertyNames: {
        pattern: '^.*$',
      },
      additionalProperties: {
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
          hidden: {
            type: 'boolean',
          },
          nowrap: {
            type: 'boolean',
          },
          'number-format': {
            type: 'string',
          },
          'date-format': {
            type: 'string',
          },
          'yes-format': {
            type: 'string',
          },
          'no-format': {
            type: 'string',
          },
          formatter: {
            type: 'string',
          },
          editable: {
            type: 'boolean',
          },
        },
        patternProperties: {
          '^type$': {
            enum: [
              'string',
              'number',
              'date',
              'datetime',
              'time',
              'enum',
              'bool',
            ],
          },
          '^enum$': {
            type: 'object',
            propertyNames: {
              pattern: '^.*$',
            },
            additionalProperties: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};

export function validateConfiguration(
  configuration: EtConfiguration,
): true | string {
  const ajv = new Ajv();
  const validate = ajv.compile(VALIDATION_JSON_SCHEMA);

  const valid = validate(configuration);

  if (!valid) {
    return validate
      .errors!.map((e) => `${e.instancePath} ${e.message}`)
      .join(' // ');
  }

  return true;
}
