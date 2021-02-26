sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, Item, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.material.MaterialEdit", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("materialEditRoute").attachMatched(this._onRouteMatched, this);
			
			this.initializeUnitComboBox();
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function (oEvent) {
			//Query material data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			this.getView().setModel(new JSONModel());
			this.queryMaterialWebService(true);
			
			this.getView().byId("unitComboBox").setSelectedItem(null);
    	},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			
		},
		
		
		/**
		 * Initializes the ComboBox for unit selection.
		 */
		initializeUnitComboBox : function () {
			var comboBoxItem = new Item();
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			comboBoxItem.setKey("ST");
			comboBoxItem.setText(oResourceBundle.getText("unit.st"));
			this.getView().byId("unitComboBox").addItem(comboBoxItem);
			
			comboBoxItem = new Item();
			comboBoxItem.setKey("L");
			comboBoxItem.setText(oResourceBundle.getText("unit.l"));
			this.getView().byId("unitComboBox").addItem(comboBoxItem);
			
			comboBoxItem = new Item();
			comboBoxItem.setKey("KG");
			comboBoxItem.setText(oResourceBundle.getText("unit.kg"));
			this.getView().byId("unitComboBox").addItem(comboBoxItem);
			
			comboBoxItem = new Item();
			comboBoxItem.setKey("T");
			comboBoxItem.setText(oResourceBundle.getText("unit.t"));
			this.getView().byId("unitComboBox").addItem(comboBoxItem);
		},
		
		
		/**
		 * Queries the material WebService. If the call is successful, the model is updated with the employee data.
		 */
		queryMaterialWebService : function(bShowSuccessMessage) {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/material");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var oModel = this.getView().getModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : sQueryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({materials : data}, true); // not aData
					
					if(data.data != null) {
						if(bShowSuccessMessage == true)
							MessageToast.show(oResourceBundle.getText("materialEdit.dataLoaded"));
					}
					else {
						if(data.message != null)
							MessageToast.show(data.message[0].text);
					}
				},
				context : this
			});                                                                 
			
			this.getView().setModel(oModel);
		},
	});
});