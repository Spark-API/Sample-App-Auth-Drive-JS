var ADSKSpark = ADSKSpark || {};

(function () {
	var Client = ADSKSpark.Client;


	/**
	 * The Assets API singleton.
	 * See reference - https://spark.autodesk.com/developers/reference/drive?deeplink=%2Freference%2Fassets
	 */
	ADSKSpark.Assets = {

		/**
		 * Get a specific asset
		 * @param {Number} assetId - The ID of the asset
		 * @returns {Promise} - A promise that will resolve to an an asset
		 */
		getAsset: function (assetId) {

			return Client.authorizedApiRequest('/assets/' + assetId)
				.get()
				.then(function (data) {
					return data;
				})
				.catch(function (error) {
					return error;
				});
		},


		/**
		 * Get logged in user assets
		 * @param {Object} params - limit/offset/sort/filter options.
		 * @returns {Promise} - A promise that will resolve to an array of assets.
		 */
		getMyAssets: function (params) {

			if (Client.isAccessTokenValid()) {
				var accessTokenObj = Client.getAccessTokenObject();

				var userId = accessTokenObj.spark_member_id;

				return Client.authorizedApiRequest('/members/' + userId + '/assets')
					.get(null, params)
					.then(function (data) {
						return data;
					})
					.catch(function (error) {
						return error;
					});
			} else {
				return Promise.reject(new Error('Access token is invalid'));
			}
		},

		/**
		 * Create a new asset for a logged in user
		 * @param {Object} asset - Asset data - title, description, tags etc
		 * @returns {Promise} - A promise that will resolve to a success/failure asset
		 */
		createAsset: function (asset) {

			//construct the full params
			var params = Object.keys(asset).map(function (k) {
				return encodeURIComponent(k) + "=" + encodeURIComponent(asset[k]);
			}).join('&');

			var headers = {'Content-type': 'application/x-www-form-urlencoded'};
			return Client.authorizedApiRequest('/assets')
				.post(headers, params)
				.then(function (data) {
					return data;
				})
				.catch(function (error) {
					return error;
				});

		},

		/**
		 * Update an asset for a logged in user
		 * @param {Object} asset - The asset we want to update, make sure that this object has an assetId property
		 * @returns {Promise} - A promise that will resolve to a success/failure asset
		 */
		updateAsset: function (asset) {
			//Make sure assetId is defined
			if (asset.assetId && !isNaN(asset.assetId)) {

				//construct the full params
				var params = Object.keys(asset).map(function (k) {
					if (k !== 'assetId') {
						return encodeURIComponent(k) + "=" + encodeURIComponent(asset[k]);
					}
				}).join('&');

				params = params.substring(0, params.length - 1);

				return Client.authorizedApiRequest('/assets/' + asset.assetId)
					.put(null, params)
					.then(function (data) {
						return data;
					})
					.catch(function (error) {
						return error;
					});

			} else {
				return Promise.reject(new Error('Proper assetId was not supplied'));
			}

		},

		/**
		 * Remove an asset for a logged in user
		 * @param {Number} assetId - The id of the asset
		 * @returns {Promise} - A promise that will resolve to an empty body with a proper success/failure response
		 */
		removeAsset: function (assetId) {
			return Client.authorizedApiRequest('/assets/' + assetId)
				.delete()
				.then(function (data) {
					return data;
				})
				.catch(function (error) {
					return error;
				});
		},

		/**
		 * Retrieve all thumbnails for an asset
		 * @param {Number} assetId - The id of the asset
		 * @returns {Promise} - A promise that will resolve to an array of asset thumbnails
		 */
		retrieveAssetThumbnails: function (assetId) {

			if (!isNaN(assetId)) {

				return Client.authorizedApiRequest('/assets/' + assetId + '/thumbnails')
					.get()
					.then(function (data) {
						var thumbnailsResp = {
							assetId: assetId,
							thumbnails: data.thumbnails
						}
						return thumbnailsResp;
					})
					.catch(function (error) {
						return error;
					});

			} else {
				return Promise.reject(new Error('Proper assetId was not supplied'));
			}
		}
		,

		/**
		 * Retrieve all sources (3d model files) for an asset
		 * @param {Number} assetId - The id of the asset
		 * @returns {Promise} - A promise that will resolve to an array of asset sources
		 */
		retrieveAssetSources: function (assetId) {

			if (!isNaN(assetId)) {

				return Client.authorizedApiRequest('/assets/' + assetId + '/sources')
					.get()
					.then(function (data) {
						var sourcesResp = {
							assetId: assetId,
							sources: data.sources
						}
						return sourcesResp;
					})
					.catch(function (error) {
						return error;
					});

			} else {
				return Promise.reject(new Error('Proper assetId was not supplied'));
			}

		}
		,

		/**
		 * Create asset thumbnail(s)
		 * @param {Number} assetId - The asset id for which the thumbnails are created
		 * @param {Array} filesArray - The files that are attached to this asset, they come in the form of [{id:"id",caption:"caption",description,"description",is_primary:true/false}]
		 * @returns {Promise} - A promise that will resolve to an asset thumbnails object
		 */
		createAssetThumbnails: function (assetId, filesArray) {

			//Make sure assetId is defined
			if (!isNaN(assetId)) {

				var thumbnails = [];

				for (var i = 0; i < filesArray.length; i++) {
					var thumbnail = {
						id: filesArray[i].id,
						caption: filesArray[i].caption ? filesArray[i].caption : '',
						description: filesArray[i].description ? filesArray[i].description : '',
						is_primary: filesArray[i].is_primary ? filesArray[i].is_primary : false
					}

					thumbnails.push(thumbnail);
				}

				var params = "thumbnails=" + JSON.stringify(thumbnails);

				var headers = {'Content-type': 'application/x-www-form-urlencoded'};
				return Client.authorizedApiRequest('/assets/' + assetId + '/thumbnails')
					.post(headers, params)
					.then(function (data) {
						return data;
					})
					.catch(function (error) {
						return error;
					});

			} else {
				return Promise.reject(new Error('Proper assetId was not supplied'));
			}


		},

		/**
		 * Create asset source(s)
		 * @param {Number} assetId - The asset id for which the thumbnails are created
		 * @param {String} fileIds - The file ids that are attached to this asset, separated by comma i.e. 123456,258242
		 * @returns {Promise} - A promise that will resolve to an asset sources object
		 */
		createAssetSources: function (assetId, fileIds) {

			//Make sure assetId is defined
			if (!isNaN(assetId)) {

				var params = 'file_ids=' + fileIds;
				var headers = {'Content-type': 'application/x-www-form-urlencoded'};
				return Client.authorizedApiRequest('/assets/' + assetId + '/sources')
					.post(headers, params)
					.then(function (data) {
						return data;
					})
					.catch(function (error) {
						return error;
					});

			} else {
				return Promise.reject(new Error('Proper assetId was not supplied'));
			}
		},

		/**
		 * Remove sources from an asset for a logged in user
		 * @param {Number} assetId - The id of the asset
		 * @param {String} fileIds - String of file ids to delete from asset
		 * @returns {Promise} - A promise that will resolve to an empty body with a proper success/failure response
		 */
		deleteAssetSources: function (assetId, fileIds) {

			//Make sure assetId is defined
			if (!isNaN(assetId)) {

				var params = '?file_ids=' + fileIds;
				return Client.authorizedApiRequest('/assets/' + assetId + '/sources' + params)
					.delete()
					.then(function (data) {
						return data;
					})
					.catch(function (error) {
						return error;
					});

			} else {
				return Promise.reject(new Error('Proper assetId was not supplied'));
			}

		}
		,

		/**
		 * Remove thumbnails from an asset for a logged in user
		 * @param {Number} assetId - The id of the asset
		 * @param {String} fileIds - Array of file ids to delete from asset
		 * @returns {Promise} - A promise that will resolve to an empty body with a proper success/failure response
		 */
		deleteAssetThumbnails: function (assetId, fileIds) {

			//Make sure assetId is defined
			if (!isNaN(assetId)) {

				var params = '?thumbnail_ids=' + fileIds;
				return Client.authorizedApiRequest('/assets/' + assetId + '/thumbnails' + params)
					.delete()
					.then(function (data) {
						return data;
					})
					.catch(function (error) {
						return error;
					});

			} else {
				return Promise.reject(new Error('Proper assetId was not supplied'));
			}

		}
	};

}());