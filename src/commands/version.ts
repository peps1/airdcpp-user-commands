import { printStatusMessage } from '../log';

// /version command
export const printVersion = async (type: string, entityId: string|number) => {
  const extensions: any = await global.SOCKET.get('extensions');
  const sysinfoResults: any = await global.SOCKET.get('system/system_info');
  const output: any = [];
  output.push('\n#######################');
  output.push(`${sysinfoResults.client_version} - ${sysinfoResults.platform} - nodejs ${process.version}`);
  output.push('#######################');
  output.push('Installed extensions:');
  extensions.forEach((ext: any) => {
    const status = (ext.running) ? 'running' : 'stopped';
    output.push(`- [ ${ext.name} ] [${status}] [${ext.version}] published by ${ext.author} (${ext.homepage || 'homepage not set'})`);
  });
  // sendMessage(message, `Extension Version: ${output}`, type);
  printStatusMessage(output.join('\n'), type, entityId);
};
