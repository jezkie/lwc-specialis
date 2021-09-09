import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { getRecord } from "lightning/uiRecordApi";
import { LightningElement, wire, api } from "lwc";
import { subscribe, unsubscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';

const LONGITUDE_FIELD = 'Boat__c.Geolocation__Longitude__s';
const LATITUDE_FIELD = 'Boat__c.Geolocation__Latitude__s';
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];

export default class BoatMap extends LightningElement {
  subscription = null;
  boatId;

  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
  }

  error = undefined;
  mapMarkers = [];

  @wire(MessageContext)
  messageContext;

  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  wiredRecord({ error, data }) {
    if (data) {
      this.error = undefined;
      const longitude = data.fields.Geolocation__Longitude__s.value;
      const latitude = data.fields.Geolocation__Latitude__s.value;
      this.updateMap(longitude, latitude);
    } else if (error) {
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }

  connectedCallback() {
    this.subscribeMC();
  }

  disconnectedCallback() {
    this.unsubscribeToMessageChannel();
  }

  unsubscribeToMessageChannel() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  subscribeMC() {
    // recordId is populated on Record Pages, and this component
    // should not update when this component is on a record page.
    if (this.subscription || this.recordId) {
      return;
    }
    // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
    this.subscription = subscribe(this.messageContext, BOATMC, (message) => {
      this.boatId = message.recordId;
    }, { scope: APPLICATION_SCOPE });
  }

  updateMap(Longitude, Latitude) {
    this.mapMarkers = [{
      location: {
        Latitude: Latitude,
        Longitude: Longitude
      }
    }];
  }

  get showMap() {
    return this.mapMarkers.length > 0;
  }


}