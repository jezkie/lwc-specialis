public with sharing class BoatDataService {
    @AuraEnabled(cacheable=true)
    public static List<BoatType__c> getBoatTypes(){
        return [SELECT Id, Name FROM BoatType__c];
    }

    @AuraEnabled(cacheable=true)
    public static List<Boat__c> getBoats(String boatTypeId){
        if (String.isEmpty(boatTypeId)) {
            return [SELECT Id, Name, BoatType__c, BoatType__r.Name, Contact__r.Name, Description__c, 
                        Geolocation__c, Length__c, Picture__c, Price__c, Year_Built__c 
                    FROM Boat__c];
        } else {
            return [SELECT Id, Name, BoatType__c, BoatType__r.Name, Contact__r.Name, Description__c, 
                        Geolocation__c, Length__c, Picture__c, Price__c, Year_Built__c 
                    FROM Boat__c WHERE BoatType__c = :boatTypeId];
        }
    }
}
