sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Item",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"./MaterialController"
], function (Controller, JSONModel, Item, MessageBox, MessageToast, MaterialController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.material.MaterialCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oView, oMessageManager, oRouter;
			
			//Register an event handler that gets called every time the router navigates to this view.
			oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("materialCreateRoute").attachMatched(this._onRouteMatched, this);
			
			//Initialize message manager for input form validation.
			oView = this.getView();
			oMessageManager = sap.ui.getCore().getMessageManager();
			oView.setModel(oMessageManager.getMessageModel(), "message");
			oMessageManager.registerObject(oView, true);
			
			this.initializeUnitComboBox();
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function (oEvent) {
			this.getView().byId("unitComboBox").setSelectedItem(null);
			this.initializeMaterialModel();
    	},
		
		
		
		/**
		 * Initializes the model to which the UI controls are bound.
		 */
		initializeMaterialModel : function () {
			var oMaterialModel = new JSONModel();
			
			oMaterialModel.loadData("model/material/materialCreate.json");
			this.getView().setModel(oMaterialModel, "newMaterial");
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
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			if(this.getView().byId("unitComboBox").getSelectedKey() == "") {
				this.showMessageOnUndefinedUnit();
				return;
			}
			
			this.validatePriceInput();
			if(MaterialController.isPriceValid(this.getView().byId("priceInput").getValue()) == false)
				return;				
			
			this.saveMaterialByWebService();
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");	
		},
		
		
		/**
		 * Validates the price input field.
		 *
		 * There is a bug in german locale when defining an Input as Number of type float.
		 * This is because the framework has a problem with the german delimiter ',' for fractional digits.
		 * See ticket here: https://github.com/SAP/openui5/issues/2558.
		 *
         * Therefore the Input is set as type String and the price is parsed manually in this function.
		 */
		validatePriceInput : function () {
			var sPriceInputString = this.getView().byId("priceInput").getValue();
			var fPricePerUnit = parseFloat(sPriceInputString);
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(isNaN(fPricePerUnit)) {
				this.getView().byId("priceInput").setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId("priceInput").setValueStateText(oResourceBundle.getText("materialCreate.useDecimalPlacesError"));
				this.getView().getModel("newMaterial").setProperty("/pricePerUnit", 0);
			}
			else {
				this.getView().byId("priceInput").setValueState(sap.ui.core.ValueState.None);
				this.getView().getModel("newMaterial").setProperty("/pricePerUnit", fPricePerUnit);			
			}
		},
		
		
		/**
		 * Displays a message in case the unit has not been selected.
		 */
		showMessageOnUndefinedUnit : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageBox.error(oResourceBundle.getText("materialCreate.noUnitSelected"));
		},
		
		
		/**
		 * Saves the material defined in the input form by using the RESTful WebService.
		 */
		saveMaterialByWebService : function () {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/material");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var oMaterialModel = this.getView().getModel("newMaterial");
			var sJSONData = oMaterialModel.getJSON();
			
			//Use "POST" to create a resource.
			var aData = jQuery.ajax({
				type : "POST", 
				contentType : "application/json", 
				url : sQueryUrl,
				data : sJSONData, 
				success : function(data, textStatus, jqXHR) {
					if(data.message != null) {
						if(data.message[0].type == 'S') {
							MessageToast.show(data.message[0].text);
							this.resetFormFields();
						}
						
						if(data.message[0].type == 'E') {
							MessageBox.error(data.message[0].text);
						}
						
						if(data.message[0].type == 'W') {
							MessageBox.warning(data.message[0].text);
						}
					}
				},
				context : this
			});    
		},
		
		
		/**
		 * Resets the form fields to the initial state.
		 */
		resetFormFields : function () {
			this.getView().byId("unitComboBox").setSelectedItem(null);
			this.getView().byId("priceInput").setValue(0);
			this.initializeMaterialModel();
		},
	});
});