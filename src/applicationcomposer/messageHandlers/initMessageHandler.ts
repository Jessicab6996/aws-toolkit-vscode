/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'path'
import { InitResponseMessage, MessageType, WebviewContext, Command } from '../types'

export function initMessageHandler(context: WebviewContext) {
    const filePath = context.defaultTemplatePath
    const responseMessage: InitResponseMessage = {
        messageType: MessageType.RESPONSE,
        command: Command.INIT,
        templateFileName: path.basename(filePath),
        templateFilePath: filePath,
    }

    context.panel.webview.postMessage(responseMessage)
}
