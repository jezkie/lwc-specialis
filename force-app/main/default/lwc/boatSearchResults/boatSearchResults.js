import { LightningElement, api } from 'lwc';
import { createRecord, getRecord, updateRecord } from 'lightning/uiRecordApi';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';

export default class BoatSearchResults extends LightningElement {

    @api
    searchBoats(boatTypeId) {
        this.dispatchEvent(new CustomEvent('loading', {}));
        getBoats({ boatTypeId: boatTypeId }).then(result => {
            console.table(result);
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            this.dispatchEvent(new CustomEvent('doneloading', {}));
        });
    }
}