import { LightningElement, api, wire, track } from 'lwc';

import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';

import { createRecord, getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { publish, MessageContext } from 'lightning/messageService';
// import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

const columns = [
    { label: 'Name', fieldName: 'Name', type: 'text', sortable: true, editable: true, initialWidth: 300 },
    { label: 'Length', fieldName: 'Length__c', type: 'text', sortable: true, editable: true, initialWidth: 80 },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', sortable: true, editable: true, initialWidth: 150, typeAttributes: { maximumFractionDigits: '2' } },
    { label: 'Description', fieldName: 'Description__c', type: 'text', sortable: true, editable: true }
];

const SUCCESS_VARIANT =  'success';
const SUCCESS_TITLE =  'Success';
const MESSAGE_SHIP_IT  = 'Ship It!';

const CONST_ERROR = 'Error';
const ERROR_VARIANT = 'error'

export default class BoatSearchResults extends LightningElement {
    @track boats = {data: []};
    @track wiredBoatsResult;
    selectedBoatId = '';
    columns = columns;
    isLoading = false;
    draftValues = [];
    boatTypeId = '';

    @wire(MessageContext)
    messageContext;

    @wire(getBoats)
    wiredBoats(result){
        this.wiredBoatsResult = result;
        if (result.data) {
            if (this.boats.data && this.boats.data.length > 0) {
                this.boats.data.splice(0, this.boats.data.length);
            }
            this.boats.data = [...this.boats.data, ...result.data];
        } else if (result.error) {
            console.log(error);
        }
    }

    @api
    searchBoats(boatTypeId) {
        this.boatTypeId = boatTypeId;
        this.boats.data.splice(0, this.boats.data.length);
        this.notifyLoading(true);
        getBoats({ boatTypeId: boatTypeId }).then(result => {
            this.boats.data = [...this.boats.data, ...result];
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            this.notifyLoading(false);
        });
    }

    async refresh(){
        this.notifyLoading(true);
        await refreshApex(this.wiredBoatsResult);
        this.notifyLoading(false);
    }

    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
    }

    sendMessageService(boatId) { }

    handleSave(event) {
        const updatedFields = event.detail.draftValues;
        // TYPICAL WAY OF UPDATING DATATABLE 
        // const recordInputs =  event.detail.draftValues.slice().map(draft => {
        //     const fields = Object.assign({}, draft);
        //     return { fields };
        // });

        // const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        // Promise.all(promises).then(() => {
        // TYPICAL WAY OF UPDATING DATATABLE

        updateBoatList({data: updatedFields}).then(() => {    
            this.dispatchEvent(
                new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    message: MESSAGE_SHIP_IT,
                    variant: SUCCESS_VARIANT
                })
            );

            this.draftValues = [];

            this.refresh();  
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: CONST_ERROR,
                    message: error.message,
                    variant: ERROR_VARIANT
                })
            );
        }).finally(() => {
            // something here perhaps?
        });
    }

    notifyLoading(isLoading) {
        if (isLoading) {
            this.dispatchEvent(new CustomEvent('loading', {}));
        } else {
            this.dispatchEvent(new CustomEvent('doneloading', {}));
        }
    }
}