import { IOutputLayer } from 'tv-automation-sofie-blueprints-integration'
import { IParsedElement } from '../ParsedElementsToSegments'
import { BodyCodes } from './BodyCodesToJS'
import * as Winston from 'winston'

import {
	ManusTypeServer,
	ManusTypeEmpty,
	ManusTypeKam,
	ManusTypeRemote,
	ManusTypeVO,
	ELEMENT_CODE_TYPES
} from '../manusConverters/ManusIndex'

interface IRundownMetaData {
	version: string
	startTime: number
	endTime: number
}

export class SplitRawDataToElements {

	static convert (_logger: Winston.LoggerInstance, rundownRaw: any[], outputLayers: IOutputLayer[]): {elements: IParsedElement[], meta: IRundownMetaData} {

		console.log('DUMMY LOG : ', outputLayers)
		let allElements: IParsedElement[] = []
		rundownRaw.forEach((root): void => {
			_logger.info(' Converting : ', root.storyName)
			const story = root.story

			let { elementCodes, script } = BodyCodes.extract(story.body)
			console.log('DUMMY LOG : ' + elementCodes + ' ' + script)

			// New section for each iNews form:
			allElements.push({
				data: {
					id: story.id,
					name: story.fields.title,
					type: 'SECTION',
					float: 'string',
					script: 'string',
					objectType: 'string',
					objectTime: 'string',
					duration: 'string',
					clipName: 'string',
					feedback: 'string',
					transition: 'string',
					attributes: { ['string']: 'string' }
				}
			})

			elementCodes.forEach((code, index) => {
				for (let type of ELEMENT_CODE_TYPES) {
					if (code.includes(type.code)) {
						switch (type.type) {
							case 1:
								allElements.push(...ManusTypeKam.convert(story, script,index))
								break
							case 2:
								allElements.push(...ManusTypeServer.convert(story, script, index))
								break
							case 3:
								allElements.push(...ManusTypeVO.convert(story, 'VO type Not Implemented', index))
								break
							case 4:
								allElements.push(...ManusTypeRemote.convert(story, 'LIVE type Not Implemented', index))
								break
							default:
								allElements.push(...ManusTypeEmpty.convert(story, 'Unknown Manus Type', index))
						}
						break
					}
				}
			})
			if (elementCodes.length === 0) {
				allElements.push(...ManusTypeEmpty.convert(story, 'Manus Segment Not Implemented', 0))
			}
		})

		return {
			meta: {
				version: 'v0.2',
				startTime: 0,
				endTime: 1
			},
			elements: allElements
		}
	}
}
