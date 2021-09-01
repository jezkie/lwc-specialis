import { LightningElement, api, wire, track } from 'lwc';
import { createRecord, getRecord, updateRecord } from 'lightning/uiRecordApi';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';

export default class BoatSearchResults extends LightningElement {
    @track boats = {data: []};

    @wire(getBoats)
    wiredBoats(result){
        if (result.data) {
            console.table(result.data);
            result.data.forEach(element => {
                this.boats.data.push(element);
            });
        } else if (result.error) {
            console.log(error);
        }
    }

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