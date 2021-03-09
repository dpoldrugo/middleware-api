// tslint:disable:variable-name
import {Factory} from "typescript-ioc";
import {ProcessorIdentifier} from "../../../model/ProcessorModel";

import {IsInt} from "typescript-rest-swagger";

export class CategoryMapPinIcon {
    public id: number;
    public name: string;
    public alternativeText: string;
    public caption: string;
    public width: number;
    public height: number;
    public formats?: any;
    public hash: string;
    public ext: string;
    public mime: string;
    public size: number;
    public url: string;
    public previewUrl?: any;
    public provider: string;
    public provider_metadata?: any;
    public created_by: number;
    public updated_by: number;
    public created_at: Date;
    public updated_at: Date;
}

export class CategoryMapPinIconAssigned {
    public id: number;
    public name: string;
    public alternativeText: string;
    public caption: string;
    public width: number;
    public height: number;
    public formats?: any;
    public hash: string;
    public ext: string;
    public mime: string;
    public size: number;
    public url: string;
    public previewUrl?: any;
    public provider: string;
    public provider_metadata?: any;
    public created_by: number;
    public updated_by: number;
    public created_at: Date;
    public updated_at: Date;
}

export class EntryCategory {
    public id: number;
    public type_slug: string;
    public type_name: string;
    public available_in_public_menu: boolean;
    public menu_title: string;
    public plural_title: string;
    public category_color_hex: string;
    public add_entry_label: string;
    public created_by: number;
    public updated_by: number;
    public created_at: Date;
    public updated_at: Date;
    public category_map_pin_icon: CategoryMapPinIcon;
    public category_map_pin_icon_assigned: CategoryMapPinIconAssigned;
}

export class Entry {
    public id: number;
    public title: string;
    public location: string;
    public location_latitude: number;
    public location_longitude: number;
    public description: string;
    public contact_name: string;
    public contact_email: string;
    public contact_phone: string;
    public contact_available_on_whatsapp: boolean;
    public contact_available_on_telegram: boolean;
    public status: string;
    public assigned_coordinator?: any;
    public volunteer_assigned?: any;
    public done: boolean;
    public follow_up_date?: any;
    public tags: string;
    public date_from?: any;
    public date_until?: any;
    public entry_category: EntryCategory;
    public notes?: any;
    public integrations_data?: IntegrationMetadata;
    public volunteer_marked_as_done?: any;
    public published_at: Date;
    public created_at: Date;
    public updated_at: Date;
    public comments: Array<any>;

    public constructor(init:Partial<Entry>) {
        Object.assign(this, init);
    }
}



export class ItemTag {
    public id: number;
    public tag: string;
    public published_at: Date;
    public created_at: Date;
    public updated_at: Date;
}

export class AvailableEntryCategory {
    public id: number;
    public type_slug: string;
    public type_name: string;
    public available_in_public_menu: boolean;
    public menu_title: string;
    public plural_title: string;
    public category_color_hex: string;
    public add_entry_label: string;
    public created_at: Date;
    public updated_at: Date;
    public category_map_pin_icon: CategoryMapPinIcon;
    public category_map_pin_icon_assigned: CategoryMapPinIconAssigned;
    public entries: Array<Entry>;
}

export class Polygon {
    public lat: number;
    public lng: number;
}

export class MapZone {
    public name: string;
    public color: string;
    public polygon: Array<Polygon>;
}

export class HeaderMenuMarketingItem {
    public id: number;
    public item_url: string;
    public item_title: string;
}

export class FooterMenuItem {
    public id: number;
    public item_url: string;
    public item_title: string;
}

export class PublicSiteSetting {
    public id: number;
    public site_title: string;
    public site_description: string;
    public footer_notice_text: string;
    public map_zones: Array<MapZone>;
    public donor_instructions: string;
    public created_at: Date;
    public updated_at: Date;
    public header_menu_marketing_items: Array<HeaderMenuMarketingItem>;
    public footer_menu_items: Array<FooterMenuItem>;
    public og_share_image?: any;
}

export class RootObject {
    public entry: Entry;
    public itemTags: Array<ItemTag>;
    public availableEntryCategories: Array<AvailableEntryCategory>;
    public publicSiteSettings: Array<PublicSiteSetting>;
}

export class Integration {
    public name: String;
    public original_id: String;

    public constructor(init:Partial<Integration>) {
        Object.assign(this, init);
    }
}

export class IntegrationRequest {
    public data: Entry;
    public integration: Integration;

    public constructor(init:Partial<IntegrationRequest>) {
        Object.assign(this, init);
    }
}

export class IntegrationResponse {
    public result: String;
    public entry: Entry;
}

export enum EntryStatus {
    novo = "novo",
    provjereno = "provjereno",
    rizicno_opasno = "rizicno_opasno",
    preuzeto = "preuzeto",
    u_izvrsavanju = "u_izvrsavanju",
    parcijalno_rijeseno = "parcijalno_rijeseno",
    treba_ponoviti = "treba_ponoviti",
    zavrseno = "zavrseno"
}

// @ts-ignore
@Factory(() => new IntegrationMetadataDefault())
export interface IntegrationMetadata {
    'potres.app': IntegrationMetadataValue;
    'potres2020': IntegrationMetadataValue;
}

export class IntegrationMetadataDefault implements IntegrationMetadata {
    public 'potres.app': IntegrationMetadataValue;
    public 'potres2020': IntegrationMetadataValue;

    constructor(processorIdentifier: ProcessorIdentifier, integrationMetadataValue: IntegrationMetadataValue) {
        if (processorIdentifier === 'potres.app') {
            this['potres.app'] = integrationMetadataValue;
        }
        else if (processorIdentifier === 'potres2020') {
            this.potres2020 = integrationMetadataValue;
        }
    }
}

export class IntegrationMetadataValue {
    // tslint:disable-next-line:variable-name
    @IsInt public original_id: number;
    // tslint:disable-next-line:variable-name
    public first_synced_on: Date;
    // tslint:disable-next-line:variable-name
    public last_synced_on: Date;
}


