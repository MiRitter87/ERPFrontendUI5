sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.department.DepartmentCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			this.initializeDepartmentModel();
			//Load all employees. Those are the candidates that can be selected in the head selection ComboBox.
			this.queryEmployeeWebService();
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			var oNewDepartment = this.getView().getModel("newDepartment");
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");	
		},
		
		
		/**
		 * Initializes the model to which the UI controls are bound.
		 */
		initializeDepartmentModel : function () {
			var oDepartmentModel = new JSONModel();
			
			oDepartmentModel.loadData("model/department/departmentCreate.json");
			this.getView().setModel(oDepartmentModel, "newDepartment");
		},
		
		
		/**
		 * Queries the employee WebService. If the call is successful, the model is updated with the employee data.
		 */
		queryEmployeeWebService : function() {
			var webServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var queryUrl = webServiceBaseUrl + "/";
			var oModel = new JSONModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : queryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({employees : data}); // not aData
					
					if(data.data == null && data.message != null)  {
						MessageToast.show(data.message[0].text);
					}
				},
				context : this
			});                                                                 
			
			this.getView().setModel(oModel);
		},
	});
});