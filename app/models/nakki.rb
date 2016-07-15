class Nakki < ActiveRecord::Base
  #attr_accessible :slot
  def create
     NakkitypeInfo.create(nakki_params)
  end

  belongs_to :user
  belongs_to :nakkitype

  validates :slot, :presence => true, :numericality => {
    :only_integer => true,
    :greater_than_or_equal_to => 0
  }
  validates :nakkitype_id, :presence => true
  private
    def nakki_params
      params.require(:nakki).permit(:slot)
    end
end
