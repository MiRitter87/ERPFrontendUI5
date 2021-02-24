sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat"
], function (Controller, JSONModel, NumberFormat) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.material.MaterialCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oView, oMessageManager;
			
			//Initialize message manager for input form validation.
			oView = this.getView();
			oMessageManager = sap.ui.getCore().getMessageManager();
			oView.setModel(oMessageManager.getMessageModel(), "message");
			oMessageManager.registerObject(oView, true);
			
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
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			this.validatePriceInput();
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			
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
				this.getView().byId("priceInput").setValueStateText(oResourceBundle.getText("departmentCreate.useDecimalPlacesError"));
				this.getView().getModel("newMaterial").setProperty("/pricePerUnit", 0);
			}
			else {
				this.getView().byId("priceInput").setValueState(sap.ui.core.ValueState.None);
				this.getView().getModel("newMaterial").setProperty("/pricePerUnit", fPricePerUnit);			
			}
		}
	});
});