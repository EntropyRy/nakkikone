class ApplicationController < ActionController::Base
  protect_from_forgery
  helper_method :current_user
  before_action :require_login
  rescue_from ActiveRecord::RecordNotFound, User::Unauthorized, User::Unauthenticated, :with => :mapped_exceptions
  skip_before_action :require_login, :only => [:bootstrap]
  
  def bootstrap
    # here we bootstrap the application so that we render static html page where the javacscript injection is present
  end

  private

  def mapped_exceptions(exception)
    case exception
    when ActiveRecord::RecordNotFound then render :status => 404, :text => "No resources"
    when User::Unauthorized           then render :status => 403, :text => "Your not admin"
    when User::Unauthenticated        then render :status => 401, :text => "Your not logged in"
    end
  end

  def get_current_party
    Party.find(params[:party_id]);
  end

  def admin_access
    raise User::Unauthorized unless current_user.role == "admin"
  end

  def require_login
    raise User::Unauthenticated unless logged_in?
  end
  
  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end

  # The logged_in? method simply returns true if the user is logged
  # in and false otherwise. It does this by "booleanizing" the
  # current_user method we created previously using a double ! operator.
  # Note that this is not common in Ruby and is discouraged unless you
  # really mean to convert something into true or false.
  def logged_in?
    !!current_user
  end
end
