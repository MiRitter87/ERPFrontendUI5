sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"./MaterialController"
], function (Controller, Item, MessageToast, MessageBox, JSONModel, MaterialController) {
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
			if(this.getView().byId("unitComboBox").getSelectedKey() == "") {
				var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageBox.error(oResourceBundle.getText("materialEdit.noUnitSelected"));
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
			this.getView().byId("materialComboBox").setSelectedItem(null);
			this.setPriceInputValue(null);
		},
		
		
		/**
		 * Handles the selection of an item in the material ComboBox.
		 */
		onMaterialSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oModel = this.getView().getModel();
			var oMaterials = oModel.oData.materials;
			var oMaterial;
			
			if(oSelectedItem == null)
				return;
			
			//Get the selected material from the array of all materials according to the id.
			for(var i = 0; i < oMaterials.data.material.length; i++) {
    			var oTempMaterial = oMaterials.data.material[i];
    			
				if(oTempMaterial.id == oSelectedItem.getKey()) {
					oMaterial = oTempMaterial;
				}
			}
			
			//Set the model of the view according to the selected material to allow binding of the UI elements.
			oModel.setData({selectedMaterial : oMaterial}, true);
			
			//Manually set the price of the Input field because the price is not directly bound due to validation reasons.
			this.setPriceInputValue(oMaterial.pricePerUnit);
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
				this.getView().byId("priceInput").setValueStateText(oResourceBundle.getText("materialEdit.useDecimalPlacesError"));
			}
			else {
				this.getView().byId("priceInput").setValueState(sap.ui.core.ValueState.None);
				this.getView().getModel().setProperty("/selectedMaterial/pricePerUnit", fPricePerUnit);			
			}
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
		
		
		/**
		 * Updates changes of the material data using the WebService.
		 */
		saveMaterialByWebService : function() {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/material");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var oMaterialModel = new JSONModel(this.getView().getModel().getProperty("/selectedMaterial"));
			var sJSONData = oMaterialModel.getJSON();
			
			//Use "PUT" to update an existing resource.
			var aData = jQuery.ajax({
				type : "PUT", 
				contentType : "application/json", 
				url : sQueryUrl,
				data : sJSONData, 
				success : function(data, textStatus, jqXHR) {
					if(data.message != null) {
						if(data.message[0].type == 'S') {
							//Update the data source of the ComboBox with the new material data.
							this.queryMaterialWebService(false);
							//Clear ComboBox preventing display of wrong data (Id - Name).
							this.getView().byId("materialComboBox").setSelectedKey(null);
							//Clear selectedMaterial because no ComboBox item is selected.
							this.getView().getModel().setProperty("/selectedMaterial", null);
							//Clear the price which is not directly bound to the model.
							this.setPriceInputValue(null);
							MessageToast.show(data.message[0].text);
						}
						
						if(data.message[0].type == 'I') {
							MessageToast.show(data.message[0].text);
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
		 * Sets the value of the priceInput.
		 */
		setPriceInputValue : function(fValue) {
			this.getView().byId("priceInput").setValue(fValue);
		}
	});
});