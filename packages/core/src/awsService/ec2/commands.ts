/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Ec2InstanceNode } from './explorer/ec2InstanceNode'
import { Ec2Node } from './explorer/ec2ParentNode'
import { SafeEc2Instance, Ec2Client } from '../../shared/clients/ec2Client'
import { copyToClipboard } from '../../shared/utilities/messages'
import { ec2LogSchema } from './ec2LogDocumentProvider'
import { getAwsConsoleUrl } from '../../shared/awsConsole'
import { showRegionPrompter } from '../../auth/utils'
import { openUrl } from '../../shared/utilities/vsCodeUtils'
import { showFile } from '../../shared/utilities/textDocumentUtilities'
import { Ec2ConnecterMap } from './connectionManagerMap'
import { Ec2Prompter, Ec2Selection, instanceFilter } from './prompter'

export async function openTerminal(connectionManagers: Ec2ConnecterMap, node?: Ec2Node) {
    const selection = await getSelection(node)
    const connectionManager = connectionManagers.getOrInit(selection.region)
    await connectionManager.attemptToOpenEc2Terminal(selection)
}

export async function openRemoteConnection(connectionManagers: Ec2ConnecterMap, node?: Ec2Node) {
    const selection = await getSelection(node)
    const connectionManager = connectionManagers.getOrInit(selection.region)
    await connectionManager.tryOpenRemoteConnection(selection)
}

export async function startInstance(node?: Ec2Node) {
    const prompterFilter = (instance: SafeEc2Instance) => instance.LastSeenStatus !== 'running'
    const selection = await getSelection(node, prompterFilter)
    const client = new Ec2Client(selection.region)
    await client.startInstanceWithCancel(selection.instanceId)
}

export async function stopInstance(node?: Ec2Node) {
    const prompterFilter = (instance: SafeEc2Instance) => instance.LastSeenStatus !== 'stopped'
    const selection = await getSelection(node, prompterFilter)
    const client = new Ec2Client(selection.region)
    await client.stopInstanceWithCancel(selection.instanceId)
}

export async function rebootInstance(node?: Ec2Node) {
    const selection = await getSelection(node)
    const client = new Ec2Client(selection.region)
    await client.rebootInstanceWithCancel(selection.instanceId)
}

export async function linkToLaunchInstance(node?: Ec2Node) {
    const region = node ? node.regionCode : (await showRegionPrompter('Select Region', '')).id
    const url = getAwsConsoleUrl('ec2-launch', region)
    await openUrl(url)
}

async function getSelection(node?: Ec2Node, filter?: instanceFilter): Promise<Ec2Selection> {
    const prompter = new Ec2Prompter(filter)
    const selection = node && node instanceof Ec2InstanceNode ? node.toSelection() : await prompter.promptUser()
    return selection
}

export async function copyInstanceId(instanceId: string): Promise<void> {
    await copyToClipboard(instanceId, 'Id')
}

export async function openLogDocument(node?: Ec2InstanceNode): Promise<void> {
    return await showFile(ec2LogSchema.form(await getSelection(node)))
}
