sap.ui.define([
	"com/infocus/salesApplication/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("com.infocus.salesApplication.controller.App", {

		onInit: function() {

			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});

			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};
			
			// Function to handle metadata loading failure
            var handleMetadataFailed = function(oError) {
                MessageBox.error("Failed to load metadata: " + oError.getParameter("message"));
                fnSetAppNotBusy();
            };

			// disable busy indication when the metadata is loaded and in case of errors

			/*this.getOwnerComponent().getModel().metadataLoaded().then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().attachMetadataFailed(handleMetadataFailed);*/
		}

	});
});