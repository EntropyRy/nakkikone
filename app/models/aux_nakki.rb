class AuxNakki < ActiveRecord::Base
  #attr_accessible :nakkiname
  def create
     Party.create(auxnakki_params)
  end

  belongs_to :user

  validates_uniqueness_of :nakkiname, :scope => [:user_id, :party_id]
  validates :user_id, :presence => true
  private
    def auxnakki_params
      params.require(:auxnakki).permit(:nakkiname)
    end
end
