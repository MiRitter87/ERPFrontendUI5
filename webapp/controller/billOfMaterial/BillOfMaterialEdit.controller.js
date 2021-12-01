sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../material/MaterialController",
	"./BillOfMaterialController",
	"../MainController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MaterialController, BillOfMaterialController, MainController, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.billOfMaterial.BillOfMaterialEdit", {		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("billOfMaterialEditRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query bill of material and material data every time a user navigates to this view. 
			//This assures that changes are being displayed in the ComboBox.
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			BillOfMaterialController.queryBillOfMaterialsByWebService(this.queryBillOfMaterialsCallback, this, true);
			
			this.getView().setModel(null, "selectedBillOfMaterial");
			this.resetUIElements();
		},
		
		
		/**
		 * Handles the selection of an item in the bill of material ComboBox.
		 */
		onBillOfMaterialSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oBillOfMaterialsModel = this.getView().getModel("billOfMaterials");
			var oBillOfMaterial, wsBillOfMaterial;
			
			if(oSelectedItem == null) {
				this.resetUIElements();
				return;
			}
				
			oBillOfMaterial = BillOfMaterialController.getBillOfMaterialById(oSelectedItem.getKey(), oBillOfMaterialsModel.oData.billOfMaterial);
			if(oBillOfMaterial != null)
				wsBillOfMaterial = this.getBillOfMaterialForWebService(oBillOfMaterial);
			
			//Set the model of the view according to the selected bill of material to allow binding of the UI elements.
			this.getView().setModel(wsBillOfMaterial, "selectedBillOfMaterial");
			
			BillOfMaterialController.initializeBillOfMaterialItemModel(this);
		},
		
		
		/**
		 * Opens the dialog to add a new bill of material item.
		 */
		onAddItemPressed : function () {
			var oResourceBundle;
			
			if(this.byId("billOfMaterialComboBox").getSelectedKey() == "") {
				oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageBox.error(oResourceBundle.getText("businessPartnerEdit.noBillOfMaterialSelected"));
				return;
			}			
			
			BillOfMaterialController.setIdOfNewItem(this.getView().getModel("selectedBillOfMaterial"), this);
			MainController.openFragmentAsPopUp(this, "ERPFrontendUI5.view.billOfMaterial.BillOfMaterialItemCreate");
		},
		
		
		/**
		 * Handles the closing by cancelation of the new item Dialog.
		 */
		onCancelDialog : function () {
			this.byId("newItemDialog").close();
			BillOfMaterialController.clearItemPopUpFields(this);
		},
		
		
		/**
		 * Formatter of the material text in the item table. Provides the name of a material based on the given ID.
		 */
		materialNameFormatter : function(iMaterialId) {
			return BillOfMaterialController.materialNameFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Formatter of the material unit in the item table. Provides the unit of a material based on the given ID.
		 */
		materialUnitFormatter: function(iMaterialId) {
			return BillOfMaterialController.materialUnitFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Creates a representation of a bill of material that can be processed by the WebService.
		 */
		getBillOfMaterialForWebService : function(oBillOfMaterial) {
			var wsBillOfMaterial = new JSONModel();
			var wsBillOfMaterialItem;
			
			//Data at head level
			wsBillOfMaterial.setProperty("/billOfMaterialId", oBillOfMaterial.id);
			wsBillOfMaterial.setProperty("/name", oBillOfMaterial.name);
			wsBillOfMaterial.setProperty("/description", oBillOfMaterial.description);
			wsBillOfMaterial.setProperty("/materialId", oBillOfMaterial.material.id);
			
			//Data at item level
			wsBillOfMaterial.setProperty("/items", new Array());
			
			for(var i = 0; i < oBillOfMaterial.items.length; i++) {
				var oTempBillOfMaterialItem = oBillOfMaterial.items[i];
				
				wsBillOfMaterialItem = new JSONModel();
				wsBillOfMaterialItem.setProperty("/itemId", oTempBillOfMaterialItem.id);
				wsBillOfMaterialItem.setProperty("/materialId", oTempBillOfMaterialItem.material.id);
				wsBillOfMaterialItem.setProperty("/quantity", oTempBillOfMaterialItem.quantity);
				
				wsBillOfMaterial.oData.items.push(wsBillOfMaterialItem.oData);
			}
			
			return wsBillOfMaterial;
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("billOfMaterialComboBox").setSelectedItem(null);
			
			this.getView().byId("idText").setText("");
			this.getView().byId("nameInput").setValue("");
			this.getView().byId("descriptionTextArea").setValue("");
			this.getView().byId("materialComboBox").setSelectedItem(null);
			
			this.getView().byId("itemTable").destroyItems();
		},
		
		
		/**
		 * Callback function of the queryMaterialsByWebService RESTful WebService call in the MaterialController.
		 */
		queryMaterialsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "materials");
		},
		
		
		/**
		 * Callback function of the queryBillOfMaterials RESTful WebService call in the BillOfMaterialController.
		 */
		queryBillOfMaterialsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("billOfMaterialEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "billOfMaterials");
		}
	});
});