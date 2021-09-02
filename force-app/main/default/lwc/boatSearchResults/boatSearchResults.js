import { LightningElement, api, wire, track } from 'lwc';

import getBoats from '@salesforce/apex/BoatDataService.getBoats';

import { createRecord, getRecord, updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columns = [
    { label: 'Name', fieldName: 'Name', type: 'text', sortable: true, editable: true, initialWidth: 300 },
    { label: 'Length', fieldName: 'Length__c', type: 'text', sortable: true, editable: true, initialWidth: 80 },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', sortable: true, editable: true, initialWidth: 150, typeAttributes: { maximumFractionDigits: '2' } },
    { label: 'Description', fieldName: 'Description__c', type: 'text', sortable: true, editable: true }
];

export default class BoatSearchResults extends LightningElement {
    @track boats = {data: []};
    @track wiredBoatsResult;
    selectedBoatId = '';
    columns = columns;
    draftValues = [];

    @wire(getBoats)
    wiredBoats(result){
        this.wiredBoatsResult = result;
        if (result.data) {
            if (this.boats.data && this.boats.data.length > 0) {
                this.boats.data.splice(0, this.boats.data.length);
            }
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
        this.boats.data.splice(0, this.boats.data.length);
        this.dispatchEvent(new CustomEvent('loading', {}));
        getBoats({ boatTypeId: boatTypeId }).then(result => {
            console.table(result);
            result.forEach(element => {
                this.boats.data.push(element);
            });
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            this.dispatchEvent(new CustomEvent('doneloading', {}));
        });
    }

    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
    }

    handleSave(event) {
        const recordInputs =  event.detail.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records Updated Successfully!!',
                    variant: 'success'
                })
            );

            this.draftValues = [];

            this.refresh();  
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'An Error Occured!!',
                    variant: 'error'
                })
            );
        }).finally(() => {
            // something here perhaps?
        });
    }

    async refresh(){
        this.dispatchEvent(new CustomEvent('loading', {}));
        await refreshApex(this.wiredBoatsResult);
        this.dispatchEvent(new CustomEvent('doneloading', {}));
    }
}