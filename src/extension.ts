import * as path from 'path';
import sizeOf from 'image-size';
import * as vscode from 'vscode';
import * as os from 'os';
import { clipboard } from 'clipboard-sys';

export function activate(context: vscode.ExtensionContext) {
	const isWindow = os.platform() === 'win32';

	console.log('Congratulations, your extension "imageinfocopier" is now active!');
	// vscode.window.showInformationMessage('Congratulations, your extension "imageinfocopier" is now active!');
	/// imageinfocopier.doCopy

	let disposable = vscode.commands.registerCommand('imageinfocopier.doCopy', async (resource) => {
		if (resource) {
			const settingConfig = vscode.workspace.getConfiguration('imageinfocopier');
			const customStr: string = settingConfig.get('customStr') || '';
			const unit: boolean = typeof settingConfig.get('unit') === 'boolean' ? !!settingConfig.get('unit') : true;
			const imagePath = resource.fsPath;
			const imageInfo = await sizeOf(imagePath);
			const nowActiveFile = vscode.window.activeTextEditor;
			console.log('imagePath', isWindow ? resource.path : resource.fsPath);
			let relaPath = isWindow ? imagePath.replace(/.*\\src/g, 'src').replaceAll('\\', '/') : imagePath.replace(/.*\/src/g, 'src');
			console.log('relaPath', relaPath);
			let finalCopy = '';
			if (nowActiveFile) {
				const filePath = nowActiveFile.document.fileName;
				console.log('filePath', filePath);
				if (filePath) {
					const nowActivePath = isWindow ? (path.dirname(filePath)).replace(/.*\\src/g, 'src').replaceAll('\\', '/') : path.dirname(filePath);
					const aimPath = isWindow ? relaPath : resource.fsPath;
					relaPath = path.relative(nowActivePath, aimPath);
					// relaPath = path.relative(path.dirname(filePath), isWindow ? resource.path : resource.fsPath);
				}
			}
			if (isWindow) {
				relaPath = relaPath.replaceAll('\\', '/');
			}
			if (customStr) {
				const width: string = unit ? <number>imageInfo.width + 'px' : String(<number>imageInfo.width);
				const height: string = unit ? <number>imageInfo.height + 'px' : String(<number>imageInfo.height);
				finalCopy = customStr.replaceAll('$width', width).replaceAll('$height', height).replaceAll('$path', `'${relaPath}'`);
			} else {
				const finalInfo: {
					width: string,
					height: string,
					'background-image': string;
					'background-size': string;
				} = {
					width: imageInfo.width + 'px',
					height: imageInfo.height + 'px',
					'background-image': `url('${relaPath}')`,
					'background-size': '100% 100%',
				};
				finalCopy = JSON.stringify(finalInfo).replace(/\,/g, ';').replace(/[{"}]/g, '');;
			}
			console.log('finalCopy', finalCopy);
			await clipboard.writeText(finalCopy);
			vscode.window.showInformationMessage(`imageInfoCopier sucess!`);
		}

	});

	context.subscriptions.push(disposable);

}

export function deactivate() { }
