// import {ManagedExtension} from 'airdcpp-extension';
import air from 'airdcpp-extension';
import 'source-map-support/register';

// Entry point that is executed by the extension manager
//
// The file isn't executed when running development server so it shouldn't
// generally contain any extension-specific code

// See https://github.com/airdcpp-web/airdcpp-extension-js for usage information
import * as Main from './main';
air.ManagedExtension(Main, {
  // Possible custom options for airdcpp-apisocket can be listed here
});
