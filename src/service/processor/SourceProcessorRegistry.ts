import {Inject, OnlyInstantiableByContainer, Singleton} from "typescript-ioc";
import {SourceIdentifier} from "../../model/ProcessorModel";
import {SourceProcessor} from "./SourceProcessor";
import {Potres2020ChangesToPotresAppProcessor} from "./potres2020_to_potres.app/Potres2020ChangesToPotresAppProcessor";

@OnlyInstantiableByContainer
@Singleton
export class SourceProcessorRegistry {

    private registry: Map<SourceIdentifier, Array<SourceProcessor>> = new Map<SourceIdentifier, Array<SourceProcessor>>();

    @Inject private potres2020ChangesToPotresAppProcessor: Potres2020ChangesToPotresAppProcessor;

    constructor() {
        this.addProcessor(this.potres2020ChangesToPotresAppProcessor);
    }

    public addProcessor(sourceProcessor: SourceProcessor) {
        let sourceProcessors = this.registry.get(sourceProcessor.sourceIdentifier());
        if (!sourceProcessors) {
            sourceProcessors = new Array<SourceProcessor>();
            this.registry.set(sourceProcessor.sourceIdentifier(), sourceProcessors);
        }
        sourceProcessors.push(sourceProcessor);
    }

    public getProcessors(sourceIdentifier: SourceIdentifier): Array<SourceProcessor> {
        const sourceProcessors = this.registry.get(sourceIdentifier);
        if (sourceProcessors)
            return sourceProcessors;
        else
            return new Array<SourceProcessor>();
    }

}