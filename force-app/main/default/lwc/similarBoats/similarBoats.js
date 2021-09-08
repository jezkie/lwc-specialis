import { LightningElement, api, wire, track } from 'lwc';
import {NavigationMixin} from 'lightning/navigation';

import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats';

export default class SimilarBoats extends LightningElement {
    // Private
    currentBoat;
    @track relatedBoats;
    boatId = 'a025g000004sj3iAAA';
    error;

    // public
    @api
    get recordId() {
        // returns the boatId
        return this.boatId;
    }

    set recordId(value) {
        // sets the boatId value
        // sets the boatId attribute
        this.boatId = value;
        this.setAttribute('boatId', value);
    }

    // public
    @api
    similarBy = 'Type';

    // Wire custom Apex call, using the import named getSimilarBoats
    // Populates the relatedBoats list
    @wire(getSimilarBoats, { boatId: '$boatId', similarBy: '$similarBy' })
    similarBoats({ error, data }) {
        if (data) {
            this.relatedBoats = data;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }

    get getTitle() {
        return 'Similar boats by ' + this.similarBy;
    }

    get noBoats() {
        return !(this.relatedBoats && this.relatedBoats.length > 0);
    }

    // Navigate to record page
    openBoatDetailPage(event) {
        debugger;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.boatId,
                objectApiName: 'Boat__c',
                actionName: 'view'
            },
        });
    }
}
