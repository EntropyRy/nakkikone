RailStrap::Application.routes.draw do

  root :to => "application#bootstrap"

  get "sign_up" => "users#new", :as => "sign_up"
  put "yourself" => "users#update"

  get "reset_password" => "users#reset_password"

  get "login" => "sessions#new"
  post "login" => "sessions#create", :as => "log_in"
 
  get "logout" => "sessions#destroy", :as => "logout"

  resources :users

  resources :nakkitype_infos

  resources :parties do
    resources :parcipitants, :nakkitypes, :nakit, :aux_nakit

    # listing nakki info descriptions
    get "nakkitype_infos" => "nakkitype_infos#party_index"
    
    # auxiliary listing and delete
    get "aux_parcipitants" => "parcipitants#aux_index"
    delete "aux_parcipitants/:id" => "aux_nakit#destroy"

    #services for regular users
    get "aux_parcipitants_names" => "parcipitants#aux_index_only_names"
    delete "cancel_all" => "parcipitants#cancel_all_from_current_user"
  end
  
  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
