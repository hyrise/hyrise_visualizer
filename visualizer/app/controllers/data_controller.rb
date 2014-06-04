class DataController < ApplicationController
	before_filter :load_data_model

	def get_content_for_series
		results = @data.getContentForSeries(params[:series], params[:xaxis], params[:filters]) unless params[:series].blank? || params[:xaxis].blank?
		render json: results
	end

	protected

		def load_data_model
			@data = Hyrise.new
		end
end
