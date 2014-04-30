class DataController < ApplicationController
	before_filter :load_data_model

	def index
		@scheme = @data.getTables
	end

	def load_table
		@data.loadTable(params[:table], params[:file]) unless params[:table].blank? || params[:file].blank?
		redirect_to root_url
	end

	def get_tables
		results = @data.getTables()
		render json: results
	end

	def get_content
		results = @data.getContentOfColumns(params[:columns]) unless params[:columns].blank?
		render json: results
	end

	def get_content_for_series
		results = @data.getContentForSeries(params[:series], params[:xaxis], params[:filters]) unless params[:series].blank? || params[:xaxis].blank?
		render json: results
	end

	def start_hyrise
		results = @data.startHyrise()
		render json: results
	end

	protected

		def load_data_model
			@data = Hyrise.new
		end
end
