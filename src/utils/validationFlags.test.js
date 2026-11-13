import test from 'node:test';
import assert from 'node:assert/strict';

import {
    parseBoolSetting,
    isMandatoryValidationForChannel,
    CHANNEL_VALIDATION_KEYS,
} from './validationFlags.js';

test('parseBoolSetting understands booleans, JSON strings and objects', () => {
    assert.equal(parseBoolSetting(true), true);
    assert.equal(parseBoolSetting(false), false);
    assert.equal(parseBoolSetting('true'), true);
    assert.equal(parseBoolSetting('false'), false);
    assert.equal(parseBoolSetting('"false"'), false);
    assert.equal(parseBoolSetting({ value: false }), false);
    assert.equal(parseBoolSetting({ enabled: true }), true);
    assert.equal(parseBoolSetting('inherit'), null);
    assert.equal(parseBoolSetting('garbage'), null);
    assert.equal(parseBoolSetting(42), null);
    assert.equal(parseBoolSetting(null), null);
    assert.equal(parseBoolSetting(undefined), null);
});

test('missing settings keep mandatory validation ON (fail-safe)', () => {
    assert.equal(isMandatoryValidationForChannel({}), true);
    assert.equal(isMandatoryValidationForChannel(null, 'web'), true);
});

test('master switch OFF disables every channel', () => {
    const settings = {
        mandatory_validation: false,
        [CHANNEL_VALIDATION_KEYS.web]: true,
        [CHANNEL_VALIDATION_KEYS.app]: true,
    };
    assert.equal(isMandatoryValidationForChannel(settings, 'web'), false);
    assert.equal(isMandatoryValidationForChannel(settings, 'app'), false);
});

test('web override can disable mandatory validation for web only', () => {
    const settings = {
        mandatory_validation: true,
        [CHANNEL_VALIDATION_KEYS.web]: false,
    };
    assert.equal(isMandatoryValidationForChannel(settings, 'web'), false);
    assert.equal(isMandatoryValidationForChannel(settings, 'app'), true);
});

test('channel override "inherit" follows the master switch', () => {
    const settings = {
        mandatory_validation: true,
        [CHANNEL_VALIDATION_KEYS.web]: 'inherit',
    };
    assert.equal(isMandatoryValidationForChannel(settings, 'web'), true);
});

test('invalid channel override is ignored (fail-safe: stay mandatory)', () => {
    const settings = {
        mandatory_validation: true,
        [CHANNEL_VALIDATION_KEYS.web]: 'garbage',
    };
    assert.equal(isMandatoryValidationForChannel(settings, 'web'), true);
});
