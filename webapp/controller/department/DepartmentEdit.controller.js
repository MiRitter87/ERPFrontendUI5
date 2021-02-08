sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.department.DepartmentEdit", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			this.getView().setModel(new JSONModel());
			this.queryDepartmentWebService();
			this.queryEmployeeWebService();
		},
		
		
		/**
		 * Handles the selection of an item in the department ComboBox.
		 */
		onDepartmentSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oModel = this.getView().getModel();
			var oDepartments = oModel.oData.departments;
			var oDepartment;
			
			if(oSelectedItem == null)
				return;
			
			//Get the selected department from the array of all departments according to the code.
			for(var i = 0; i < oDepartments.data.department.length; i++) {
    			var oTempDepartment = oDepartments.data.department[i];
    			
				if(oTempDepartment.code == oSelectedItem.getKey()) {
					oDepartment = oTempDepartment;
				}
			}
			
			//Set the model of the view according to the selected department to allow binding of the UI elements.
			oModel.setData({departments:oDepartments, selectedDepartment : oDepartment}, true);
		},
		
		
		/**
		 * Queries the employee WebService. If the call is successful, the model is updated with the employee data.
		 */
		queryDepartmentWebService : function() {
			var webServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/department");
			var queryUrl = webServiceBaseUrl + "/";
			var oModel = this.getView().getModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : queryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({departments : data}, true); // not aData
					
					if(data.data != null) {
						MessageToast.show(oResourceBundle.getText("departmentEdit.dataLoaded"));
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
		 * Queries the employee WebService. If the call is successful, the model is updated with the employee data.
		 */
		queryEmployeeWebService : function() {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var oModel = this.getView().getModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : sQueryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({employees : data}, true); // not aData
					
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