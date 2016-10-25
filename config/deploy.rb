require "rvm/capistrano"
require "bundler/capistrano"

set :application, "nakkikone"

set :repository, "git://github.com/EntropyRy/nakkikone.git"
set :branch, "hotfix/old-environment"
set :git_enable_submodules, 1
set :scm_verbose, true

# set :scm, :git # You can set :scm explicitly or Capistrano will make an intelligent guess based on known version control directory names
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`

set :deploy_to, "/var/railsapps/#{application}"
set :deploy_via, :remote_cache

set :user, "entropy"
set :domain, "entropy-host" #this host alias should be configured to your .ssh configuration where one does the deployment
set :use_sudo, false 
server domain, :app, :web, :db, :primary => true

# if you want to clean up old releases on each deploy uncomment this:
# after "deploy:restart", "deploy:cleanup"

# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

namespace :deploy do
  desc "Symlink shared configs and folders on each release."
  task :symlink_shared, :roles => :app do
    run "ln -nfs #{shared_path}/config/secrets.yml #{release_path}/config/secrets.yml"
    run "ln -nfs #{shared_path}/config/email.yml #{release_path}/config/email.yml"
    run "ln -nfs #{shared_path}/config/database.yml #{release_path}/config/database.yml"
  end

  task :start do ; end
  task :stop do ; end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end
end
after 'deploy:finalize_update', 'deploy:symlink_shared'
