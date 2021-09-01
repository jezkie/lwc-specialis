public with sharing class BoatDataService {
    @AuraEnabled(cacheable=true)
    public static List<BoatType__c> getBoatTypes(){
        return [SELECT Id, Name FROM BoatType__c];
    }

    @AuraEnabled
    public static List<Boat__c> getBoats(String boatTypeId){
        return [SELECT Id, Name, BoatType__c, Contact__r.Name, Description__c, 
                    Geolocation__c, Length__c, Picture__c, Price__c, Year_Built__c 
                FROM Boat__c WHERE BoatType__c = :boatTypeId];
    }
}
