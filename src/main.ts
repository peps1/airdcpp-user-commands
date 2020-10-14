'use strict';

import type { APISocket } from 'airdcpp-apisocket';
import { onChatCommand, onOutgoingHubMessage, onOutgoingPrivateMessage } from './chat';


const CONFIG_VERSION = 1;

// This will be populated with version from webpack
declare const EXTENSION_VERSION: string;


// Settings manager docs: https://github.com/airdcpp-web/airdcpp-extension-settings-js
import SettingsManager from 'airdcpp-extension-settings';


export default (socket: APISocket, extension: any) => {

  globalThis.SOCKET = socket;

  // Default settings
  const SettingDefinitions = [
    {
      key: 'output_directory',
      title: 'Output directory',
      default_value: extension.logPath + 'output',
      type: 'string'
    }
  ];

	// INITIALIZATION
	globalThis.SETTINGS = SettingsManager(globalThis.SOCKET, {
		extensionName: extension.name,
		configFile: extension.configPath + 'config.json',
		configVersion: CONFIG_VERSION,
		definitions: [
			...SettingDefinitions,
		],
	});


  extension.onStart = async (sessionInfo: any) => {

    await globalThis.SETTINGS.load();

    const subscriberInfo = {
      id: 'user_commands',
      name: 'User commands',
    };

    if (sessionInfo.system_info.api_feature_level >= 4) {
      globalThis.SOCKET.addListener('hubs', 'hub_text_command', onChatCommand.bind(null, 'hubs'));
      globalThis.SOCKET.addListener('private_chat', 'private_chat_text_command', onChatCommand.bind(null, 'private_chat'));
    } else {
      globalThis.SOCKET.addHook('hubs', 'hub_outgoing_message_hook', onOutgoingHubMessage, subscriberInfo);
      globalThis.SOCKET.addHook('private_chat', 'private_chat_outgoing_message_hook', onOutgoingPrivateMessage, subscriberInfo);
    }
  };
};
