import { LightningElement, api, wire, track } from 'lwc';

import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';

import { createRecord, getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

const columns = [
    { label: 'Name', fieldName: 'Name', type: 'text', sortable: true, editable: true, initialWidth: 300 },
    { label: 'Length', fieldName: 'Length__c', type: 'text', sortable: true, editable: true, initialWidth: 80 },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', sortable: true, editable: true, initialWidth: 150, typeAttributes: { maximumFractionDigits: '2' } },
    { label: 'Description', fieldName: 'Description__c', type: 'text', sortable: true, editable: true }
];

const SUCCESS_VARIANT = 'success';
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship It!';

const CONST_ERROR = 'Error';
const ERROR_VARIANT = 'error'

export default class BoatSearchResults extends LightningElement {
    @track boats;
    @track draftValues = [];

    columns = columns;
    selectedBoatId = '';
    isLoading = false;
    boatTypeId = '';

    @wire(MessageContext)
    messageContext;

    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats(result) {
        this.boats = result;
        if (result.error) {
            this.error = result.error;
            this.boats = undefined;
        }

        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }

    @api
    searchBoats(typeId) {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        this.boatTypeId = typeId;
    }

    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(selectedBoatId);
    }

    sendMessageService(boatId) {
        const payload = { recordId: boatId };
        publish(this.messageContext, BOATMC, payload);
    }

    handleSave(event) {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        const updatedFields = event.detail.draftValues;

        updateBoatList({ data: updatedFields }).then(() => {
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
            this.isLoading = false;
            this.notifyLoading(this.isLoading);
        });
    }

    async refresh() {
        await refreshApex(this.boats);
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }

    notifyLoading(isLoading) {
        if (isLoading) {
            this.dispatchEvent(new CustomEvent('loading', {}));
        } else {
            this.dispatchEvent(new CustomEvent('doneloading', {}));
        }
    }
}